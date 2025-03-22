# hard_ai.py - 困难难度的Hex游戏AI

import random
import math

class HardAI:
    """
    困难难度的Hex游戏AI
    使用Monte Carlo方法和简单的评估函数选择移动
    """
    
    def __init__(self):
        self.name = "Hard AI"
        self.max_simulations = 100  # 每步移动的模拟次数
    
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
        
        # 如果是第一步移动，选择中心位置
        if len(empty_cells) == board_size * board_size:
            center = board_size // 2
            return {'q': center, 'r': center}
        
        # 如果是第二步移动且是蓝方，考虑使用交换规则
        if len(empty_cells) == board_size * board_size - 1 and player == 'blue':
            # 找到红方的第一步移动
            red_move = None
            for r in range(board_size):
                for q in range(board_size):
                    if board[r][q] == 'red':
                        red_move = (q, r)
                        break
                if red_move:
                    break
            
            # 如果红方第一步不是在中心位置，考虑使用交换规则
            if red_move:
                q, r = red_move
                center = board_size // 2
                if q != center or r != center:
                    # 计算对称位置
                    new_q = board_size - 1 - q
                    new_r = board_size - 1 - r
                    return {'q': new_q, 'r': new_r}
        
        # 使用Monte Carlo方法评估每个可能的移动
        best_move = None
        best_score = float('-inf')
        
        for q, r in empty_cells:
            # 模拟这个移动
            score = self.evaluate_move(board, board_size, q, r, player)
            
            # 更新最佳移动
            if score > best_score:
                best_score = score
                best_move = (q, r)
        
        if best_move:
            q, r = best_move
            return {'q': q, 'r': r}
        
        # 如果没有找到好的移动，随机选择一个
        q, r = random.choice(empty_cells)
        return {'q': q, 'r': r}
    
    def evaluate_move(self, board, board_size, q, r, player):
        """
        评估一个移动的得分
        使用Monte Carlo模拟和启发式评估
        """
        # 创建棋盘副本
        board_copy = [row[:] for row in board]
        board_copy[r][q] = player
        
        # 基础分数 - 考虑位置
        score = self.position_score(q, r, board_size, player)
        
        # 连接性分数 - 检查与同色棋子的连接
        score += 2 * self.connectivity_score(board_copy, q, r, board_size, player)
        
        # 路径分数 - 检查是否有通向目标边界的路径
        score += 3 * self.path_potential_score(board_copy, board_size, player)
        
        # Monte Carlo模拟
        wins = 0
        opponent = 'blue' if player == 'red' else 'red'
        
        for _ in range(self.max_simulations):
            # 创建模拟棋盘
            sim_board = [row[:] for row in board_copy]
            current = opponent  # 从对手开始
            
            # 随机填充棋盘
            empty = []
            for sim_r in range(board_size):
                for sim_q in range(board_size):
                    if sim_board[sim_r][sim_q] is None:
                        empty.append((sim_q, sim_r))
            
            random.shuffle(empty)
            
            for sim_q, sim_r in empty:
                sim_board[sim_r][sim_q] = current
                current = opponent if current == player else player
            
            # 检查胜利
            if self.check_win(sim_board, board_size, player):
                wins += 1
        
        # 添加Monte Carlo分数
        score += (wins / self.max_simulations) * 10
        
        return score
    
    def position_score(self, q, r, board_size, player):
        """
        基于位置的评分
        中心和靠近自己边界的位置得分更高
        """
        center = board_size // 2
        # 到中心的距离
        distance_to_center = math.sqrt((q - center)**2 + (r - center)**2)
        center_score = 1 - (distance_to_center / (board_size * 1.5))
        
        # 到边界的距离分数
        if player == 'red':  # 红方连接左右
            edge_score = min(q, board_size - 1 - q) / board_size
        else:  # 蓝方连接上下
            edge_score = min(r, board_size - 1 - r) / board_size
        
        return center_score + edge_score
    
    def connectivity_score(self, board, q, r, board_size, player):
        """
        检查与同色棋子的连接性
        """
        # 六边形的六个相邻方向
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1), (-1, 1), (1, -1)
        ]
        
        connected_count = 0
        for dq, dr in directions:
            new_q = q + dq
            new_r = r + dr
            
            # 检查边界
            if 0 <= new_q < board_size and 0 <= new_r < board_size:
                # 检查是否是同一玩家的棋子
                if board[new_r][new_q] == player:
                    connected_count += 1
        
        return connected_count / 6.0  # 归一化分数
    
    def path_potential_score(self, board, board_size, player):
        """
        评估从一边到另一边的潜在路径
        使用简单的启发式方法
        """
        if player == 'red':  # 红方连接左右
            # 检查是否有从左到右的潜在路径
            left_connected = False
            right_connected = False
            
            for r in range(board_size):
                if board[r][0] == player:
                    left_connected = True
                if board[r][board_size-1] == player:
                    right_connected = True
            
            if left_connected and right_connected:
                return 1.0
            elif left_connected or right_connected:
                return 0.5
        else:  # 蓝方连接上下
            # 检查是否有从上到下的潜在路径
            top_connected = False
            bottom_connected = False
            
            for q in range(board_size):
                if board[0][q] == player:
                    top_connected = True
                if board[board_size-1][q] == player:
                    bottom_connected = True
            
            if top_connected and bottom_connected:
                return 1.0
            elif top_connected or bottom_connected:
                return 0.5
        
        return 0.0
    
    def check_win(self, board, board_size, player):
        """
        检查玩家是否获胜
        使用深度优先搜索检查是否有连接两边的路径
        """
        if player == 'red':  # 红方连接左右
            # 检查每个左边的红色格子
            for r in range(board_size):
                if board[r][0] == player:
                    # 从这个格子开始DFS
                    visited = [[False for _ in range(board_size)] for _ in range(board_size)]
                    if self.dfs_red(board, visited, r, 0, board_size):
                        return True
        else:  # 蓝方连接上下
            # 检查每个上边的蓝色格子
            for q in range(board_size):
                if board[0][q] == player:
                    # 从这个格子开始DFS
                    visited = [[False for _ in range(board_size)] for _ in range(board_size)]
                    if self.dfs_blue(board, visited, 0, q, board_size):
                        return True
        
        return False
    
    def dfs_red(self, board, visited, r, q, board_size):
        """
        红方的深度优先搜索
        检查是否有路径从左边连接到右边
        """
        # 标记当前格子为已访问
        visited[r][q] = True
        
        # 如果到达右边界，返回True
        if q == board_size - 1:
            return True
        
        # 六边形的六个相邻方向
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1), (-1, 1), (1, -1)
        ]
        
        # 检查所有相邻的格子
        for dq, dr in directions:
            new_r = r + dr
            new_q = q + dq
            
            # 检查边界
            if 0 <= new_r < board_size and 0 <= new_q < board_size:
                # 检查是否是同一玩家的棋子且未访问过
                if board[new_r][new_q] == 'red' and not visited[new_r][new_q]:
                    if self.dfs_red(board, visited, new_r, new_q, board_size):
                        return True
        
        return False
    
    def dfs_blue(self, board, visited, r, q, board_size):
        """
        蓝方的深度优先搜索
        检查是否有路径从上边连接到下边
        """
        # 标记当前格子为已访问
        visited[r][q] = True
        
        # 如果到达下边界，返回True
        if r == board_size - 1:
            return True
        
        # 六边形的六个相邻方向
        directions = [
            (-1, 0), (1, 0), (0, -1), (0, 1), (-1, 1), (1, -1)
        ]
        
        # 检查所有相邻的格子
        for dq, dr in directions:
            new_r = r + dr
            new_q = q + dq
            
            # 检查边界
            if 0 <= new_r < board_size and 0 <= new_q < board_size:
                # 检查是否是同一玩家的棋子且未访问过
                if board[new_r][new_q] == 'blue' and not visited[new_r][new_q]:
                    if self.dfs_blue(board, visited, new_r, new_q, board_size):
                        return True
        
        return False