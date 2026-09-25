import { getCurrentUser } from "@/lib/auth/current-user";
import { MergeError, executeMerge, previewMerge } from "@/lib/account/merge-account";
import { isMergeTokenFormat } from "@/lib/account/merge-token";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

async function authorize(token: unknown) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (user.isAnonymous) return Response.json({ error: "sign_in_required" }, { status: 403 });
  if (!isMergeTokenFormat(token)) return Response.json({ error: "invalid_token" }, { status: 400 });
  return user;
}

function errorResponse(error: unknown) {
  if (error instanceof MergeError) return Response.json({ error: error.code }, { status: error.code === "invalid_token" ? 400 : 409 });
  console.error(JSON.stringify({ event: "merge_error", message: (error as Error)?.message }));
  return Response.json({ error: "server_error" }, { status: 500 });
}

/** POST {token, confirm?} : không có `confirm` thì trả số dữ liệu sẽ gộp; `confirm: true` thì thực hiện gộp. Cần đã đăng nhập Google. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: unknown; confirm?: unknown };
  const user = await authorize(body.token);
  if (user instanceof Response) return user;
  const sb = createSupabaseServiceClient();
  try {
    if (body.confirm === true) {
      await executeMerge(sb, body.token as string, user.id);
      return Response.json({ merged: true });
    }
    return Response.json(await previewMerge(sb, body.token as string));
  } catch (error) {
    return errorResponse(error);
  }
}
