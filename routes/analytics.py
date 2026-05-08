from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from services.analytics_service import get_task_analytics

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/api/analytics', methods=['GET'])
@login_required
def get_analytics():
    stats = get_task_analytics(current_user.id)
    return jsonify(stats)
