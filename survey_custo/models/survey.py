from odoo import models, fields, api


class Survey(models.Model):
    _inherit = 'survey.survey'

    jitsi_room_name = fields.Char("Jitsi Room Name", required=True)
