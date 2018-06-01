

    function quiz() {
        const URL = "https://opentdb.com/api.php?";
        const amount = document.getElementById("amount");
        if ((!amount.value.match(/^[0-9]+$/)) || parseInt(amount.value) < 0 || parseInt(amount.value) > 60) {

            alert("Invalid input. Please enter number only!");
            return;
        }

        var username = document.getElementById("username");
        username = username ? username : "Player";
        const category = document.getElementById("category");

        //filtered dynamic URL
        var finalURL = URL + "amount=" + amount.value + "&category=" + category.value + "&difficulty=" + difficulty.value + "&type=multiple"; //filter option

        document.getElementById("quiz").style.display = "block";

        fetch(finalURL)
            .then(response => response.json())
            .then(
                data => {
                    var currQuestion = 0;
                    var corrAnswer = 0;
                    var incorrAnswer = 0;
                    var speed = 60000;
                    var setTime;
                    var startOver = false;

                    //main function
                    $(document).ready(function () {
                        displayCurrQuestion();
                        hint();
                        timer();
                        scoreCount();

                        $("#leaderBoard").hide();
                        $("#leader").hide();

                        //main function when clicking "Next" button
                        $(this).find("#next").on("click", function () {

                            //if not quit halfway through the game
                            if (!startOver) {
                                value = $("input[type='radio']:checked").val();
                                // if user do not make a choice
                                if (value == undefined) {
                                    $(document).find("#message").text("Please choose an answer").show();
                                }
                                //if user made a choice, then test the choice
                                else {
                                    $(document).find("#message").hide();
                                    // if user made the right choice , add 10 points
                                    if (value == data.results[currQuestion].correct_answer) {
                                        corrAnswer += 10;
                                        scoreCount();
                                        stopTimer();
                                    }
                                    // if user did not make the right choice, add 1 incorrect count
                                    if (value != data.results[currQuestion].correct_answer) {
                                        incorrAnswer += 1;
                                        stopTimer();
                                    }
                                    currQuestion++;
                                    //if the incorrect answer is >= 3, end the game
                                    if (incorrAnswer > 2) {
                                        //if the user has not gained a min of 50 $, then no money
                                        stopTimer();
                                        if (corrAnswer < 50) {
                                            //corrAnswer = 0;
                                            scoreCount();
                                            $(this).text("Restart");
                                            $(document).find("#message").text("You lost the game! No money can be claimed...").show();
                                            $(document).find(".timer").hide();

                                        }
                                        else { //otherwise the user gain a min of 50$ when lost
                                            scoreCount();
                                            $(this).text("Restart");
                                            $(document).find("#message").text("You lost! But you gained a minimum of $" + corrAnswer).show();
                                            $(document).find(".timer").hide();
                                        }
                                        //design of the board display
                                        $(document).find("#question").hide();
                                        $(document).find("#choiceList").hide();
                                        $(document).find("#quit").hide();
                                        $(document).find("#next").click(function () {
                                            location.reload(true)
                                        });
                                        startOver = true;
                                    }
                                    //before last array object
                                    if (currQuestion < data.results.length) {
                                        displayCurrQuestion();
                                        timer();
                                    }

                                    else { //last - finish the game
                                        $(this).text("Finished!");
                                        stopTimer();
                                        $(document).find("#quit").hide();
                                        startOver = true;
                                    }
                                }

                            } else { //game finished
                                startOver = false;
                                $(document).find("#next").text("Restart").on("click", function () {
                                    location.reload(true)
                                }).hide();

                                //re-arrange the display board
                                $(document).find("#quit").hide();
                                $(document).find("#question").hide();
                                $(document).find("#choiceList").hide();
                                $(document).find("#score").hide();
                                $(document).find(".timer").remove();
                                if (corrAnswer <= 0) {
                                    $(document).find("#message").text("You have complete the game. Your final amount is: $0 ").show();
                                }
                                else {
                                    $(document).find("#message").text("You have complete the game. Your final amount is: $" + corrAnswer).show();
                                }

                                //Show leader board with descending order
                                $("#leader").show();
                                $(document).find("#leader").on("click", function () {
                                    $("#leader").hide();
                                    $("#next").show();
                                    var localStorage = window.localStorage;  //create local storage to capture caches
                                    var scoreBoard = JSON.parse(localStorage.getItem("scoreBoard"));
                                    scoreBoard = scoreBoard ? scoreBoard : [];
                                    scoreBoard.push({"name": username.value, "score": "$" + corrAnswer});
                                    localStorage.setItem("scoreBoard", JSON.stringify(scoreBoard));
                                    //Sort score from the largest to smallest
                                    scoreBoard.sort(function (a, b) {
                                        for (var i = 0; i < scoreBoard.length; i++) {
                                            var scoreA = a.score;
                                            var scoreB = b.score;
                                            return (scoreA > scoreB) ? -1 : (scoreA < scoreB) ? 1 : 0;
                                        }
                                    });
                                    //Kasim table template
                                    let table = $('<table></table>');
                                    //header
                                    let row = $('<tr></tr>');
                                    let colname = $('<td></td>').text("Name");
                                    let colscore = $('<td></td>').text("Prize");
                                    row.append(colname);
                                    row.append(colscore);
                                    table.append(row);
                                    //score history
                                    for (let score of scoreBoard) {
                                        let row = $('<tr></tr>');
                                        let colname = $('<td></td>').text(score.name);
                                        let colscore = $('<td></td>').text(score.score);
                                        row.append(colname);
                                        row.append(colscore);
                                        table.append(row);
                                    }
                                    $("#leaderBoard").empty();
                                    $("#leaderBoard").append(table);
                                    $("#leaderBoard").show();
                                    resetQuiz();
                                });
                            }
                        });
                        //quit button
                        $(this).find("#quit").on("click", function () { //quit halfway through
                            $(document).find("#question").hide();
                            $(document).find("#choiceList").hide();
                            $(document).find("#message").hide();
                            $(document).find("#quit").hide();
                            $(document).find(".timer").remove();
                            $(document).find("#score").hide();
                            if (corrAnswer <= 0) {
                                $(document).find("#quitScreen").text("You have quit the game. Your final amount is: $0 ").show();

                            }
                            else {
                                $(document).find("#quitScreen").text("You have quit the game. Your final amount is: $" + corrAnswer).show();
                            }
                            $(document).find("#next").text("Restart");
                            stopTimer();
                            $(document).find("#next").click(function () {
                                location.reload(true)
                            });

                        });
                    });

                    function displayCurrQuestion() {
                        var choiceList = $(document).find("#choiceList");
                        $("#5050").show();
                        $(document).find("#question").html(data.results[currQuestion].question).text(); //decode html to text
                        $(choiceList).find("li").remove(); //remove all choices
                        var choice;
                        //add new choices
                        for (var i = 0; i < 3; i++) {
                            choice = data.results[currQuestion].incorrect_answers[i];
                            $(
                                '<li id = "answer' + [i] + '"><input type ="radio" name="answer" value="' + data.results[currQuestion].incorrect_answers[i] + '" />' + choice + '</li>'
                                //either way works:
                                // "<li id = 'answer" + [i] + "'><input type ='radio' name='answer' value='"+ data.results[currQuestion].incorrect_answers[i]+"' />" + choice + "</li>"

                            ).appendTo(choiceList);
                        }
                        $(
                            '<li><input type ="radio" name="answer" value="' + escapeHtml(data.results[currQuestion].correct_answer) + '" />' + data.results[currQuestion].correct_answer + '</li>'
                        ).appendTo(choiceList);

                        //Fisher-Yates shuffle:
                        var ul = document.querySelector('ul');
                        for (var i = ul.children.length; i >= 0; i--) {
                            ul.appendChild(ul.children[Math.random() * i | 0]);
                        }

                        function escapeHtml(text) {
                            return text
                                .replace(/&/g, "&amp;")
                                .replace(/</g, "&lt;")
                                .replace(/>/g, "&gt;")
                                .replace(/"/g, "&quot;")
                                .replace(/'/g, "&#039;");
                        }
                    }

                    //reset quiz
                    function resetQuiz() {
                        currQuestion = 0;
                        corrAnswer = 0;
                        incorrAnswer = 0;
                    }

                    //score board count function
                    function scoreCount() {
                        $(document).ready(function () {
                            //display correct answer score (10 points each) + min $50:
                            if (corrAnswer <= 0) {
                                $("#score").text("Your current amount is : $0 ").show();
                            }
                            else {
                                $("#score").text("Your current amount is : $" + corrAnswer).show();
                            }
                        });
                    }

                    function stopTimer() {
                        $("#progressbar").stop(true);
                        $("#progressbar").width(800);
                        clearTimeout(setTime);
                    }

                    function timer() {
                        $(document).ready(function () {
                            var time = ($("#progressbar").width() / 800) * speed;
                            setTime = setTimeout(function () {
                                $("#question").fadeOut();
                                $("#choiceList").fadeOut();
                                $("#next").fadeOut();
                                $(".timer").fadeOut();
                                $("#quit").text("Restart");
                                $("#quit").click(function () {
                                    location.reload(true)
                                });
                                if (corrAnswer <= 0) {
                                    $("#message").text("Your time is up. Here is your final amount: $0 ").show();
                                }
                                else {
                                    $("#message").text("Your time is up. Here is your final amount: $" + corrAnswer).show();
                                }
                            }, time);
                            $("#progressbar").animate({width: 0 + "px"}, time, "linear");
                        });
                    }

                    function hint() {
                        //use $1 to add some extra time
                        $("#addTime").click(function () {
                            if (corrAnswer < 1) {
                                $("#message").text("Sorry, you need $1 to use it!").show();
                            }
                            else {
                                corrAnswer -= 1;
                                $("#progressbar").stop(true);
                                $("#progressbar").width(Math.min($("#progressbar").width() + (800 / 60), 800));
                                clearTimeout(setTime);
                                timer();
                                scoreCount();
                            }
                        });
                        //use $5 to take a 5050 hint
                        $("#5050").click(function () {
                            if (corrAnswer < 5) {
                                $("#message").text("Sorry, you need $5 to use it!").show();
                            }
                            else {
                                corrAnswer -= 5;
                                $("#5050").fadeOut()
                                $("#answer0").fadeOut();
                                $("#answer1").fadeOut();
                                scoreCount();
                            }
                        });
                    }
                }
                //end of data function
            ).catch(console.log);
        //end of the quiz function
    }
