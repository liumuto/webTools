# coding:utf-8
"""
使用 ak.stock_zh_a_spot,从新浪财经获取 A 股 所有股票的实时行情数据列表(股票列表)

学习交流群：韭菜分析①股票量化，484123223
雪球帐号：韭菜分析
淘宝小店：韭菜分析小店

欢迎交流！

"""
import akshare as ak
import pandas as pd


class ZhA:
    """
    获取 A 股数据的类
    1.从网上下载所有A股实时行情数据列表、股票代码(下载保存到本地文件.csv) 列表
    """
    def __init__(self):  # 初始化
        self.is_test = False  # 是否测试模式（True-测试,只测部分数据，False-正式应用）
        self.filename_stock_codes_zh_a = "stock_code_names.csv"     # A股股票代码列表文件名
        self.stock_zh_a_spot_df = None
        self.symbol_col = 1  # 代码列索引(从文件读入的为1，从网上下载的为0)
        self.col_date = 1  # 日期列索引(从文件读入的为1，从网上下载的为0,都以它为参照，避免出错)

        # 路径
        self.jc_data_path = ''

    def down_stock_codes_zh_a(self):
        """
        从网上下载所有A股股票代码(下载保存到本地文件) 列表: A股
        实际是所有股票的实时行情数据列表
        行情中心首页 > A股 > 分类 > 沪深A股
        https://vip.stock.finance.sina.com.cn/mkt/#hs_a
        :return:
        """
        self.stock_zh_a_spot_df = ak.stock_zh_a_spot()
        # print(self.stock_zh_a_spot_df)
        self.stock_zh_a_spot_df = self.stock_zh_a_spot_df[['代码', '名称']]
        self.stock_zh_a_spot_df.to_csv(self.jc_data_path + self.filename_stock_codes_zh_a)
        self.symbol_col = 0  # 代码列索引(与文件的索引差1，这里的序号index不算1列)

    def read_stock_codes_zh_a(self):
        """
        从默认本地文件读取 所有A股股票代码(必须先下载保存到本地)列表: 全部A股
        :return:
        """
        filename = self.jc_data_path + self.filename_stock_codes_zh_a
        self.read_stock_codes_zh_a_file(filename)

    def read_stock_codes_zh_a_file(self, filename):
        """
        从指定本地文件读取 所有A股股票代码(必须先下载保存到本地)列表
        :return:
        """
        self.stock_zh_a_spot_df = pd.read_csv(filename, parse_dates=[1])
        self.symbol_col = 1  # 代码列索引

    # 析构函数
    def __del__(self):
        pass


if __name__ == '__main__':
    """
    主程序: 下载数据
    """
    zh_a = ZhA()  # 创建股票数据对象

    # 从网上下载所有A股股票实时行情-股票代码(下载保存到本地文件)
    # 重复运行本函数会被新浪暂时封 IP
    zh_a.down_stock_codes_zh_a()



