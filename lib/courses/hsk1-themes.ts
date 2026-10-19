// Chủ đề cho lộ trình HSK 1 (HSK 3.0): thứ tự học và các từ thuộc từng chủ đề, soạn tay để mỗi chặng có một mạch (gia đình, ăn uống, thời gian...) thay vì gom ngẫu nhiên.
// Một từ chỉ thuộc chủ đề đầu tiên nó xuất hiện; từ không có trong danh sách HSK 1 được bỏ qua; từ HSK 1 không thuộc chủ đề nào được gom vào các chặng "Từ thông dụng khác" theo tần suất.
export interface HskTheme { id: string; title: string; words: string[] }

const w = (s: string) => s.split(/\s+/).filter(Boolean);

export const HSK1_THEMES: HskTheme[] = [
  { id: "pronouns", title: "Đại từ cơ bản", words: w("我 你 他 她 我们 你们 他们 她们 您 这 那 这里 那里 这儿 那儿 这边 那边") },
  { id: "questions", title: "Hỏi và đáp, chào hỏi", words: w("什么 谁 哪 哪儿 哪里 怎么 几 多少 吗 呢 吧 是不是 干什么 请问 没什么 对不起 没关系 谢谢 不客气 再见 请 请进 请坐") },
  { id: "basics", title: "Từ nối và từ thông dụng", words: w("的 了 是 在 有 不 没 没有 和 也 都 很 就 要 会 能 想 还 还是 再 最 太 非常 真 真的 对 错 好 从 给 跟 比 着 过 到") },
  { id: "numbers", title: "Số đếm", words: w("零 一 二 两 三 四 五 六 七 八 九 十 百 半 第 第二 一半") },
  { id: "measure", title: "Lượng từ và tiền bạc", words: w("个 本 块 元 毛 分 岁 号 次 间 页 一些 有些 有的 点 一点儿 一下儿 一会儿 杯 口 钱 钱包 多 少") },
  { id: "family", title: "Gia đình", words: w("爸爸 妈妈 爸 妈 哥哥 姐姐 弟弟 妹妹 哥 姐 弟 妹 爷爷 奶奶 奶 儿子 女儿 家人 孩子 家 家里") },
  { id: "people", title: "Con người và nghề nghiệp", words: w("人 朋友 同学 老师 学生 医生 工人 先生 小姐 男人 女人 男 女 男生 女生 男孩儿 女孩儿 小孩儿 男朋友 女朋友 小朋友 老人 病人 网友 大学生 中学生 小学生") },
  { id: "days", title: "Ngày, tháng, năm", words: w("今天 明天 昨天 后天 前天 天 日 日期 星期 星期天 星期日 月 年 今年 去年 明年 新年 生日 半年 半天") },
  { id: "daytime", title: "Thời gian trong ngày", words: w("现在 时间 时候 小时 早 晚 早上 上午 中午 下午 晚上 白天 马上 常常 常 有时 有时候 上次 下次 先 后 前 最后") },
  { id: "food", title: "Ăn uống", words: w("吃 喝 饭 米饭 面条儿 面包 包子 鸡蛋 牛奶 水 水果 茶 菜 肉 早饭 午饭 晚饭 吃饭 好吃 饿 渴 杯子") },
  { id: "direction", title: "Phương hướng và vị trí", words: w("上 下 左 右 里 外 中 东 西 南 北 上边 下边 左边 右边 前边 后边 里边 外边 旁边 中间 东边 南边 西边 北边 一边 地上 楼上 楼下 路上 车上 身上") },
  { id: "places", title: "Địa điểm", words: w("学校 大学 中学 小学 图书馆 医院 商店 商场 书店 饭店 电影院 机场 车站 洗手间 房间 教学楼 学院 地方 地点 路口 马路 路 国家 国 中国 北京 外国 国外 山") },
  { id: "transport", title: "Đi lại", words: w("车 汽车 火车 飞机 打车 开车 上车 下车 车票 机票 门票 票 走路 站 飞 走 跑") },
  { id: "study", title: "Học tập", words: w("学 学习 读 读书 写 汉字 汉语 中文 外语 课 课本 课文 考 考试 字 书 本子 书包 听写 教 上课 下课 上学 放学 放假 请假 知识 记 记住 记得 忘 忘记 明白 认识 知道 回答 介绍 告诉 问") },
  { id: "actions", title: "Hành động hằng ngày", words: w("看 听 说 做 去 来 坐 住 拿 放 买 送 找 叫 爱 喜欢 用 打 开 关 洗 穿 睡 睡觉 起床 休息 笑 唱 唱歌 玩儿 帮 帮忙 见 见面 看见 听见 听到 看到 找到 得到 来到 回到 回 回来 回去 回家 进 进来 进去 出 出来 出去 起 起来 上班 下班 上网 开会 打电话 打球 打开 关上 准备 等 试 觉得 说话 在家") },
  { id: "adjectives", title: "Tính từ miêu tả", words: w("大 小 高 新 老 快 慢 冷 热 累 忙 难 重 远 贵 白 干净 好看 好听 好玩儿 有名 有用 坏 不对 差 一样 重要 认真 高兴 生气") },
  { id: "body-nature", title: "Cơ thể, sức khỏe và thời tiết", words: w("身体 手 病 生病 看病 天气 雨 下雨 风 树 花") },
  { id: "things", title: "Đồ vật quanh nhà", words: w("桌子 床 电脑 手机 电视 电视机 电话 衣服 地图 门 门口 楼 房子 东西 电影 歌 电 包") },
];
