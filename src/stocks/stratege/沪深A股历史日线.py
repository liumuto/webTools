# coding:utf-8
"""
使用 ak.stock_zh_a_daily,从新浪财经获取 A 股上市公司指定日期间的历史行情日频率数据
命令行执行的话，一定要在当前目录下运行：python 沪深A股历史日线.py

学习交流群：韭菜分析①股票量化，484123223
雪球帐号：韭菜分析
淘宝小店：韭菜分析小店

欢迎交流！

"""
import os
import time

import akshare as ak
import pandas as pd
from numpy import random


class ZhA:
    """
    获取 A 股数据的类
    1.从网上下载所有A股股票代码(下载保存到本地文件.csv) 列表
    2.从网上下载所有A股股票日线数据(下载保存到本地文件.csv)，从股市第1天（19900101）开始到今天
    """
    def __init__(self):  # 初始化
        self.is_test = False  # 是否测试模式（True-测试,只测部分数据，False-正式应用）
        self.filename_stock_codes_zh_a = "stock_codes_zh_a.csv"     # A股股票代码列表文件名
        self.stock_zh_a_spot_df = None
        self.symbol_col = 1  # 代码列索引(从文件读入的为1，从网上下载的为0)
        self.col_date = 1  # 日期列索引(从文件读入的为1，从网上下载的为0,都以它为参照，避免出错)

        # 创建数据目录
        self.jc_data_path = 'data_day/'     # 必须要后面的/
        if not os.path.exists(self.jc_data_path):
            os.mkdir(self.jc_data_path)

        # 完整路径
        basedir = os.path.dirname(__file__)
        # 组合成完整路径
        self.jc_data_path = os.path.join(basedir, self.jc_data_path)

    def get_count_test(self, total):
        """
        根据是否测试模式，返回真正需要运行的记数，便于统一测试
        :return: count
        """
        if self.is_test:
            count = 15  # 测试
        else:
            count = total
        return count

    def down_stock_codes_zh_a(self):
        """
        从网上下载所有A股股票代码(下载保存到本地文件) 列表: A股
        实际是所有股票的实时行情数据列表
        https://vip.stock.finance.sina.com.cn/mkt/#hs_a
        :return:
        """
        self.stock_zh_a_spot_df = ak.stock_zh_a_spot()
        # print(self.stock_zh_a_spot_df)
        self.stock_zh_a_spot_df.to_csv(self.jc_data_path + self.filename_stock_codes_zh_a, encoding='gbk')
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
        self.stock_zh_a_spot_df = pd.read_csv(filename, parse_dates=[1], encoding='gbk')
        self.symbol_col = 1  # 代码列索引

    def down_stock_zh_a_daily(self, adjust: str = ""):
        """
        从网上下载所有A股股票历史日线数据(下载保存到本地文件)（当天的注意看是几点才更新，3点当天还没更新，也不会下载）
        先下载，后面再读取分析，避免多次下载
        :param adjust: 默认为空: 返回不复权的数据; "qfq": 返回前复权后的数据; "hfq": 返回后复权后的数据; hfq-factor: 返回后复权因子; hfq-factor: 返回前复权因子
        :type adjust: str
        :return:
        """
        start_time = time.time()  # 记录开始时间
        print('下载开始：' + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time)))  # 格式化自己想输出的形式
        today = time.strftime('%Y%m%d', time.localtime(start_time))

        # 从本地文件读取所有A股股票代码
        filename = self.jc_data_path + self.filename_stock_codes_zh_a
        self.read_stock_codes_zh_a_file(filename)

        # 下载每一支股票日线数据
        total = len(self.stock_zh_a_spot_df)  # 总股票数
        print('A股总数:' + str(total))
        count = self.get_count_test(total)
        bj_flag = 'bj'  # 北交所标志
        kcb_flag = 'sh688'     # 科创板标志
        for i in range(count):
            # 获取A股代码
            # symbol_code = "sh510150"  # 消费ETF
            symbol_code = self.stock_zh_a_spot_df.iloc[i, self.symbol_col]  # 代码
            symbol_name = self.stock_zh_a_spot_df.iloc[i, self.symbol_col + 1]  # 名称

            # if bj_flag in symbol_code:  # 过滤北交所股票
            #     continue
            # if kcb_flag in symbol_code:  # 过滤科创板股票
            #     continue

            # 下载一支股票
            try:
                # 获取历史日线数据
                stock_zh_a_daily_qfq_df = ak.stock_zh_a_daily(symbol=symbol_code, start_date='19900101',
                                                              end_date=today, adjust=adjust)
                # print(stock_zh_a_daily_qfq_df)
                stock_zh_a_daily_qfq_df.to_csv(self.jc_data_path + symbol_code + '_day_' + adjust + '.csv')
            except Exception as ex:
                print("下载 %s %s 出错了：" % (symbol_code, symbol_name), ex)

            # 打印下载进度(不换行输出)
            end_time = time.time()
            strfime = time.strftime("%H:%M:%S", time.gmtime((end_time - start_time)))
            str1 = '下载完成：{} {},'.format(symbol_code, symbol_name)
            have_xz = i+1    # 下载完成个数
            str2 = '进度:{}%(已分析:{}/总股票数：{})，'.format(int(have_xz / total * 100), have_xz, total, strfime)
            str3 = '用时：{}'.format(strfime)
            print('\r ' + str1 + str2 + str3, end=" ")

            # 暂停时间，避免被封
            # time.sleep(random.randint(1, 3))  # 随机产生获取json请求的间隔时间(1-3s)
            time.sleep(random.randint(0, 1))  # 随机产生获取json请求的间隔时间(0-1s)
        print('\n下载结束：' + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))  # 格式化自己想输出的形式

    def down_stock_zh_a_daily_one(self, stock_code, adjust: str = ""):
        """
        从网上下载一支A股股票日线数据(下载保存到本地文件)
        先下载，后面再读取分析，避免多次下载
        :param stock_code: 股票代号（如：sh600000，全代码）
        :param adjust: 默认为空: 返回不复权的数据; "qfq": 返回前复权后的数据; "hfq": 返回后复权后的数据; hfq-factor: 返回后复权因子; hfq-factor: 返回前复权因子
        :type adjust: str
        :return:
        """
        start_time = time.time()  # 记录开始时间
        print('下载开始：' + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(start_time)))  # 格式化自己想输出的形式
        today = time.strftime('%Y%m%d', time.localtime(start_time))

        # 下载每一支股票日线数据
        # symbol_code = "sh510150"  # 消费ETF
        symbol_code = stock_code
        symbol_name = ''    # 这里还没有名称
        # symbol_name = self.stock_zh_a_spot_df.iloc[i, self.symbol_col + 1]  # 名称

        # 下载一支股票
        try:
            # 获取历史日线数据
            stock_zh_a_daily_qfq_df = ak.stock_zh_a_daily(symbol=symbol_code, start_date='19900101',
                                                          end_date=today, adjust=adjust)
            stock_zh_a_daily_qfq_df.to_csv(self.jc_data_path + symbol_code + '_day_' + adjust + '.csv')
        except Exception as ex:
            print("下载 %s %s 出错了：" % (symbol_code, symbol_name), ex)

        # 打印
        print('\n下载结束：' + time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(time.time())))  # 格式化自己想输出的形式

    # 析构函数
    def __del__(self):
        pass


if __name__ == '__main__':
    """
    主程序: 下载数据
    Please wait for a moment: 100%|██████████| 63/63 [00:44<00:00,  1.43it/s]
    下载开始：2022-11-06 21:58:40
    A股总数:4976
    下载完成：sz301389 C隆扬,进度:100%(已分析:4976/总股票数：4976)，用时：00:23:15 
    下载结束：2022-11-06 22:21:55
    """
    zh_a = ZhA()  # 创建股票数据对象

    # 从网上下载所有A股股票代码(下载保存到本地文件)
    # 重复运行本函数会被新浪暂时封 IP
    # 重复运行时，可注释该行 ********************
    zh_a.down_stock_codes_zh_a()

    # 从网上下载所有A股股票日线数据(下载保存到本地文件)
    # adjust: 默认为空: 返回不复权的数据; "qfq": 返回前复权后的数据; "hfq": 返回后复权后的数据;
    # "hfq-factor": 返回后复权因子; "hfq-factor": 返回前复权因子
    adjust = ""  # 默认为空: 返回不复权的数据;
    zh_a.down_stock_zh_a_daily(adjust)


