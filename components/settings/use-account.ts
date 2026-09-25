"use client";

import { useEffect, useState } from "react";
import { fetchAccountInfo, type AccountInfo } from "@/lib/auth/account-client";

/** undefined = đang tải; null = chưa có phiên nào. */
export function useAccount(): AccountInfo | null | undefined {
  const [account, setAccount] = useState<AccountInfo | null | undefined>(undefined);
  useEffect(() => {
    fetchAccountInfo().then(setAccount, () => setAccount(null));
  }, []);
  return account;
}
