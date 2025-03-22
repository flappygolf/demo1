# server.py - Hex游戏后端服务器

from flask import Flask, request, jsonify, send_from_directory
import os
import json
import importlib.util
import sys
from werkzeug.utils import secure_filename

# 导入AI模块
from ai.easy_ai import EasyAI
from ai.medium_ai import MediumAI
from ai.hard_ai import HardAI

app = Flask(__name__, static_folder='../Frontend')

# 配置上传文件夹
UPLOAD_FOLDER = 'custom_ai'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 全局变量
custom_ai = None

# 路由：主页
@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

# 路由：静态文件
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory(app.static_folder, path)

# 路由：获取AI移动
@app.route('/get_ai_move', methods=['POST'])
def get_ai_move():
    try:
        # 获取请求数据
        data = request.json
        board_data = data.get('board')
        board_size = data.get('size', 11)
        difficulty = data.get('difficulty', 'medium')
        current_player = data.get('player', 'blue')
        
        # 选择AI
        ai = None
        if data.get('use_custom_ai', False) and custom_ai is not None:
            ai = custom_ai
        else:
            if difficulty == 'easy':
                ai = EasyAI()
            elif difficulty == 'medium':
                ai = MediumAI()
            else:  # hard
                ai = HardAI()
        
        # 获取AI移动
        move = ai.get_move(board_data, board_size, current_player)
        
        return jsonify({
            'success': True,
            'move': move
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

# 路由：上传自定义AI
@app.route('/upload_ai', methods=['POST'])
def upload_ai():
    try:
        # 检查是否有文件
        if 'ai_file' not in request.files:
            return jsonify({
                'success': False,
                'error': '没有找到文件'
            })
        
        file = request.files['ai_file']
        
        # 检查文件名
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': '没有选择文件'
            })
        
        # 保存文件
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # 加载自定义AI
        try:
            global custom_ai