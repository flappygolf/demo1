# easy_ai.py - 简单难度的Hex游戏AI

import random

class EasyAI:
    """
    简单难度的Hex游戏AI
    使用随机策略选择移动
    """
    
    def __init__(self):
        self.name = "Easy AI"
    
    def get_move(self, board, board_size, player):
        """
        获取AI的下一步移动
        
        参数:
            board: 二维数组表示的棋盘状态
            board_size: 棋盘大小
            player: 当前玩家 ('red' 或 'blue')
            
        返回:
            dict: 包含移动位置的字典 {q: 列索引, r: 行索引}
        """
        # 收集所有空格子
        empty_cells = []
        for r in range(board_size):
            for q in range(board_size):
                if board[r][q] is None:
                    empty_cells.append((q, r))
        
        # 如果没有可用的移动，返回None
        if not empty_cells:
            return None
        
        # 随机选择一个空格子
        q, r = random.choice(empty_cells)
        
        return {'q': q, 'r': r}