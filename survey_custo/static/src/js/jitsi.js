odoo.define("survey_custo", function(require) {
    "use strict";

    var SurveySessionManage = require("survey.session_manage");

    SurveySessionManage.include({
        start: function() {
            console.log(this);
            var self = this;
            var room = this.$el.data('surveyRoom');
            console.log(room);
            this.fadeInOutTime = 500;
            var parent_node = this.$(document).prevObject[0].querySelector(".o_survey_session_chart");
            const domain = 'meet.jit.si';
            const options = {
                roomName: room, // with roomName, join -- without create
                width: 700,
                height: 700,
                parentNode: parent_node
            };
            if (parent_node != null) {
                const api = new JitsiMeetExternalAPI(domain, options);
            }
            return this._super.apply(this, arguments).then(function() {
                // general survey props
                self.surveyId = self.$el.data('surveyId');
                self.surveyAccessToken = self.$el.data('surveyAccessToken');
                self.isStartScreen = self.$el.data('isStartScreen');
                self.isLastQuestion = self.$el.data('isLastQuestion');
                // scoring props
                self.isScoredQuestion = self.$el.data('isScoredQuestion');
                self.sessionShowLeaderboard = self.$el.data('sessionShowLeaderboard');
                self.hasCorrectAnswers = self.$el.data('hasCorrectAnswers');
                // display props
                self.showBarChart = self.$el.data('showBarChart');
                self.showTextAnswers = self.$el.data('showTextAnswers');

                var isRpcCall = self.$el.data('isRpcCall');
                if (!isRpcCall) {
                    self._startTimer();
                    $(document).on('keydown', self._onKeyDown.bind(self));
                }

                self._setupIntervals();
                self._setupCurrentScreen();
                var setupPromises = [];
                setupPromises.push(self._setupTextAnswers());
                setupPromises.push(self._setupChart());
                setupPromises.push(self._setupLeaderboard());

                return Promise.all(setupPromises);
            });
        }
    })

});