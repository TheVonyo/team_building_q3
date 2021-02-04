odoo.define('survey_custo.block_button_nextquestion', function (require) {
    'use strict';
    
    var sessionManage = require('survey.session_manage');
    
    sessionManage.include({
        /**
         * @override
         */
        start: function () {
            var def = this._super.apply(this, arguments);
            return def;
        },

        _nextQuestion: function () {
            var self = this;
    
            this.isStartScreen = false;
            if (this.surveyTimerWidget) {
                this.surveyTimerWidget.destroy();
            }
    
            var resolveFadeOut;
            var fadeOutPromise = new Promise(function (resolve, reject) { resolveFadeOut = resolve; });
            this.$el.fadeOut(this.fadeInOutTime, function () {
                resolveFadeOut();
            });
    
            var nextQuestionPromise = this._rpc({
                route: _.str.sprintf('/survey/session/next_question/%s', self.surveyAccessToken)
            });
    
            // avoid refreshing results while transitioning
            if (this.resultsRefreshInterval) {
                clearInterval(this.resultsRefreshInterval);
                delete this.resultsRefreshInterval;
            }
    
            Promise.all([fadeOutPromise, nextQuestionPromise]).then(function (results) {
                if (results[1]) {
                    var $renderedTemplate = $(results[1]);
                    self.$el.replaceWith($renderedTemplate);
                    self.attachTo($renderedTemplate);
                    self.$el.fadeIn(self.fadeInOutTime, function () {
                        self._startTimer();
                    });

                    //--------- New code to hide the button at the begining of the question---------
                    self.$('.o_survey_session_navigation_next').addClass('d-none');

                } else if (self.sessionShowLeaderboard) {
                    // Display last screen if leaderboard activated
                    self.isLastQuestion = true;
                    self._setupLeaderboard().then(function () {
                        self.$('.o_survey_session_leaderboard_title').text(_('Final Leaderboard'));
                        self.$('.o_survey_session_navigation_next').addClass('d-none');
                        self.$('.o_survey_leaderboard_buttons').removeClass('d-none');
                        self.leaderBoard.showLeaderboard(false, false);
                    });
                } else {
                    self.$('.o_survey_session_close').click();
                }
            });
        },

        _refreshResults: function () {
            var self = this;
            return this._rpc({
                route: _.str.sprintf('/survey/session/results/%s', self.surveyAccessToken)
            }).then(function (questionResults) {
                if (questionResults) {
                    self.attendeesCount = questionResults.attendees_count;
                    
                    //---------- Custom code to avoid going to next question if not everyone answered--------
                    if (questionResults.answer_count < self.attendeesCount){
                        self.$('.o_survey_session_navigation_next').addClass('d-none');
                    }
                    else {
                        self.$('.o_survey_session_navigation_next').removeClass('d-none');
                    }
    
                    if (self.resultsChart && questionResults.question_statistics_graph) {
                        self.resultsChart.updateChart(JSON.parse(questionResults.question_statistics_graph));
                    } else if (self.textAnswers) {
                        self.textAnswers.updateTextAnswers(questionResults.input_line_values);
                    }
    
                    var max = self.attendeesCount > 0 ? self.attendeesCount : 1;
                    var percentage = Math.min(Math.round((questionResults.answer_count / max) * 100), 100);
                    self.$('.progress-bar').css('width', `${percentage}%`);
    
                    if (self.attendeesCount && self.attendeesCount > 0) {
                        var answerCount = Math.min(questionResults.answer_count, self.attendeesCount);
                        self.$('.o_survey_session_answer_count').text(answerCount);
                        self.$('.progress-bar.o_survey_session_progress_small span').text(
                            `${answerCount} / ${self.attendeesCount}`
                        );
                    }
                }
    
                return Promise.resolve();
            }, function () {
                // on failure, stop refreshing
                clearInterval(self.resultsRefreshInterval);
                delete self.resultsRefreshInterval;
            });
        },
    
    });
});