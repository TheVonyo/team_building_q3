# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

from odoo import fields, http, _

class Survey(http.Controller):


    "'/sign/survey/%s' % answer.id"
    @http.route('/sign/survey/<int:answer>', type='http', auth='user', website=True)
    def sign(self, answer, **post):
        answer_id = request.env['survey.user_input'].search([('id', '=', answer)])

        answer_id.signature = 
