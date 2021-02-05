# -*- coding: utf-8 -*-

from odoo import api, fields, models

class Survey(models.Model):
    _inherit = 'survey.user_input'

    signature = fields.Image('Signature', help='Signature received through the portal.', copy=False, attachment=True, max_width=1024, max_height=1024)
    signature_ip = fields.Char()
