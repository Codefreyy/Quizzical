## Testing Document

### 1. Username and Bonus Category Selection

| Feature             | Test Content                                                                      | Passed? |
| ------------------- | --------------------------------------------------------------------------------- | ------- |
| Username validation | Inputting empty or whitespace username triggers an alert and continues prompting. | Yes     |
| Bonus Category      | Input validation ensures only numbers 1 through 4 are accepted.                   | Yes     |

### 2. Answering Process

| Feature                                 | Test Content                                                        | Passed? |
| --------------------------------------- | ------------------------------------------------------------------- | ------- |
| Multiple-choice                         | Observe to ensure there are no multiple correct answer question.    | Yes     |
| Select question difficulty              | Select next question's difficulty and display the corresponding one | Yes     |
| Option to quit and retain current score | Gain 2 points and click quit to see if the score is retained        | Yes     |
| Choice correctness judgement            | Correctly judge user's choice(wrong or false) and hightlight them.  | Yes     |

### 3. Score Management

| Feature          | Test Content                                                                  | Passed? |
| ---------------- | ----------------------------------------------------------------------------- | ------- |
| Score Allocation | Scores are allocated based on question difficulty.                            | Yes     |
| Score Tracking   | Best and current scores are tracked.                                          | Yes     |
| Score Monitoring | Correct and incorrect answer counts are monitored.                            | Yes     |
| Score Clearing   | If incorrect answers exceed three times, score is cleared, and the game ends. | Yes     |
| Bonus Scoring    | Bonus Category questions result in doubled scores.                            | Yes     |
| Local Storage    | Usernames and best scores are stored in local storage.                        | Yes     |
| Leaderboard      | Top ten user scores are displayed on a leaderboard at the end of each game.   | Yes     |

### 4. User Rights

| Feature           | Test Content                                                                | Passed? |
| ----------------- | --------------------------------------------------------------------------- | ------- |
| Answer Assistance | Users can delete Half Btn once per game. The delete number should be right. | Yes     |
| Time Pause        | Users can pause the timer for one minute once per game.                     | Yes     |

### 5. Time Management

| Feature                         | Test Content Passed?                                                                 | Passed |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------ |
| Time Limit                      | Each question has a 30-second time limit for answering.                              | Yes    |
| Time Exceeding                  | Answers exceeding the time limit are considered incorrect and continue next question | Yes    |
| Time exceeding causes game ends | The wrong answers exceed three. Everything reset and waiting to restart.             | Yes    |
| Timer Reset                     | Timer resets and resumes with each new question fetched or user action.              | Yes    |
