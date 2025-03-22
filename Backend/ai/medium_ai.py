# medium_ai.py - 中等难度的Hex游戏AI

import random

class MediumAI:
    """
    中等难度的Hex游戏AI
    使用简单的启发式策略选择移动
    """
    
    def __init__(self):
        self.name = "Medium AI"
    
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
        
        # 如果是第一步移动，选择中心位置或其附近
        if len(empty_cells) == board_size * board_size:
            center = board_size // 2
            return {'q': center, 'r': center}
        
        # 检查是否有可以连接的棋子
        for q, r in empty_cells:
            # 检查周围是否有同色棋子
            if self.has_adjacent_same_color(board, q, r, player, board_size):
                # 有一定概率选择这个位置
                if random.random() < 0.7:  # 70%的概率选择有连接的位置
                    return {'q': q, 'r': r}
        
        # 检查是否有对手即将连接成功的位置需要阻止
        opponent = 'blue' if player == 'red' else 'red'
        for q, r in empty_cells:
            # 检查周围是否有对手棋子
            if self.has_adjacent_same_color(board, q, r, opponent, board_size):
                # 有一定概率选择这个位置进行阻止
                if random.random() < 0.6:  # 60%的概率选择阻止对手
                    return {'q': q, 'r': r}
        
        # 优先选择边缘位置
        edge_cells = []
        for q, r in empty_cells:
            if q == 0 or q == board_size - 1 or r == 0 or r == board_size - 1:
                edge_cells.append((q, r))
        
        if edge_cells and random.random() < 0.4:  # 40%的概率选择边缘
            q, r = random.choice(edge_cells)
            return {'q': q, 'r': r}
        
        # 随机选择一个空格子
        q, r = random.choice(empty_cells)
        return {'q': q, 'r': r}
    
    def has_adjacent_same_color(self, board, q, r, player, board_size):
        """
        检查指定位置周围是否有同色棋子
        """
        # 六边形的六个相邻方向
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1), (-1, 1), (1, -1)
        ]
        
        for dq, dr in directions:
            new_q = q + dq
            new_r = r + dr
            
            # 检查边界
            if 0 <= new_q < board_size and 0 <= new_r < board_size:
                # 检查是否是同一玩家的棋子
                if board[new_r][new_q] == player:
                    return True
        
        return False