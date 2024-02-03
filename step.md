问题

1. 游戏开始时，向用户展示 4 个随机选择的类别，让他们从中选择一个 bonus 类别，如果玩家正确回答类别中的问题，获得双倍积分
2. 允许用户选择下一个问题的难度(easy, medium, or hard)
3. 问题以随机顺序呈现
4. 防止问题多次出现
5. 每个问题结束后，玩家可以选择退出游戏，保留分数

分数

1. 根据问题的难度为为玩家分配分数（例如简单 = 1；中等 = 2；困难 = 3
2. 跟踪玩家的最佳得分 和 当前得分（存储在 localstorage)，显示在屏幕上
3. 跟踪玩家错误回答的数量，错答到 3 个，分数清零并输掉游戏。
4. 玩家正确回答类别中的问题，获得双倍积分
5. 跟踪前十名得分以及获得这些得分的玩家的姓名。每场比赛结束后，在排行榜上显示姓名和分数。

用户特权

1. 允许玩家请求删除某个问题的两个错误答案，留下正确答案和一个错误答案。
   每场比赛只允许一次。
2. 允许玩家将问题的计时器暂停 1 分钟，以便他们可以尝试找到答案。每场比赛只允许一次。
3. 允许玩家询问系统答案是什么（“询问主机”）。系统应该选择一个答案，并说明其答案的正确性有多大。系统应该有机会选择错误的答案或说它不知道答案。发生这些不同结果的可能性应由问题的难度决定（例如，系统更有可能为简单问题给出正确答案，但不知道困难问题的答案）。

时间

1. 提供一个倒计时时钟，限制回答问题的时间。如果时间耗尽，则视为玩家答错。
2. 若玩家使用暂停计时器功能，时间应对应更改

用户流程
currentScore
BestScore
WrongAnswer

1. 打开网页，输入用户名，点击开始游戏。
2. 向用户展示 4 个随机选择的类别，让他们从中选择一个 bonus 类别，记住那个 bonus 类别，当之后选中了这个类别的问题，分数\*2
3. 每一题都让用户选择问题的难度，获取问题数据，展示在页面上。用户选择答案后，判断正误，给出正确答案。同时更新 currentScore、wrongAnswer 的数据和视图。如果 wrongAnswer >=3，结束游戏并显示分数。

Bonus: 给问题增加计时功能 4. 每一题结束后，让用户选择结束游戏或继续下一题。

Difficulties and bugs

1. Continue button not disappear

   setTimeout(() => {
   // ensure that the display property is set after other changes in the DOM have taken effect
   nextQuestionButton.style.display = "none"
   })

   When you use setTimeout with a delay of 0 milliseconds, it allows the current execution context to complete, and the provided function is then added to the message queue and executed in the next event loop cycle. This can give the browser a chance to update the DOM before changing the style. Essentially, it helps ensure that the style changes occur after other pending tasks, and this can prevent potential conflicts or timing issues with the DOM updates.
