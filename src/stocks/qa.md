# 量化选股系统 - 问答记录

## 2024年12月19日 - 板块筛选功能完善

### 问题描述
用户希望完善股票筛选功能，支持沪深主板、创业板、科创板、北交所等不同板块的股票筛选。需要根据各板块的股票代码前缀规则来实现筛选功能。

### 解决方案

#### 1. 获取板块命名规则
通过网上搜索获取了各板块的股票代码前缀规则：
- **沪市主板**：600、601、603、605开头
- **深市主板**：000、001、002、003、004开头  
- **创业板**：300、301开头
- **科创板**：688开头
- **北交所**：8开头（82优先股、83/87普通股、88公开发行）

#### 2. 后端实现

**数据获取模块 (`数据获取模块.py`)**：
- 在`DataManager`类中添加了`market_rules`字典，定义各板块的代码前缀规则
- 新增`get_stock_market()`方法，根据股票代码判断所属板块
- 新增`filter_stocks_by_market()`方法，根据指定板块筛选股票

**API接口 (`quantitative_selection.py`)**：
- 更新`get_stock_list()`方法，支持`markets`参数进行板块筛选
- 更新`batch_select_stocks()`方法，支持板块筛选参数
- 新增`get_market_info()`方法，返回板块信息和规则

**路由接口 (`routes.py`)**：
- 更新`/api/stocks/list`接口，支持`markets`查询参数
- 更新`/api/stocks/select`接口，支持`markets`请求参数
- 新增`/api/stocks/markets`接口，获取板块信息

#### 3. 前端实现

**HTML界面 (`myStock.html`)**：
- 在基础设置区域添加了板块筛选复选框
- 支持选择沪市主板、深市主板、创业板、科创板、北交所

**JavaScript功能 (`quantitative.js`)**：
- 新增`getSelectedMarkets()`方法，获取用户选中的板块
- 更新`getStrategyConfig()`方法，包含板块筛选参数
- 新增`loadMarketInfo()`方法，加载板块信息
- 更新选股请求，包含板块筛选参数

**CSS样式 (`main.css`)**：
- 新增`.market-checkboxes`样式，美化板块选择区域
- 支持网格布局，禁用状态样式

#### 4. 测试验证

创建了`test_market_filter.py`测试脚本，验证功能：
- ✅ 板块识别功能正常
- ✅ 板块筛选功能正常  
- ✅ API集成功能正常
- ✅ 从5430只A股中成功筛选出1695只沪市主板股票

### 主要代码变更

1. **数据获取模块**：添加板块识别和筛选逻辑
2. **API接口**：支持板块筛选参数
3. **前端界面**：添加板块选择控件
4. **测试脚本**：验证功能正确性

### 遇到的问题和解决方法

**问题**：PowerShell不支持`&&`操作符
**解决**：分别执行`cd`和`python`命令

**问题**：测试脚本输出被缓冲
**解决**：使用`python -u`参数强制无缓冲输出

### 后续优化建议

1. **性能优化**：对于大量股票的板块筛选，可以考虑使用数据库索引
2. **用户体验**：添加板块统计信息显示（如各板块股票数量）
3. **功能扩展**：支持自定义板块规则，支持更多市场（如港股、美股）
4. **数据缓存**：缓存板块筛选结果，提高响应速度

### 技术要点

- 使用正则表达式匹配股票代码前缀
- 支持多板块同时筛选
- 前端界面响应式设计
- API接口向后兼容

### 测试结果

```
🚀 开始测试板块筛选功能...
✅ 板块识别测试完成
✅ 板块筛选测试完成  
✅ API集成测试完成
🎉 所有测试完成！
```

功能已成功实现并通过测试验证。

---

## 2025-10-08 通达信选股公式：知行趋势线与N型上涨组合

### 问题描述
基于“知行趋势线”逻辑构建一套通达信选股策略，组合条件包含：
- N型上涨趋势
- 趋势向上
- KDJ 的 J < 13（注意：不是 -13）
- 缩量回调（加入多种完美图形识别）
- 顶部无量（优化）并带“假阴真阳”与“大绿帽”识别
- 知行趋势线判断（白线金叉 + K线带量上黄线 + 不跌破黄线）
- 识别无异常涨停

### 解决方案与思路
1. 复刻“知行趋势线”核心：白线 `EMA(EMA(C,10),10)`；黄线为多周期均线的均值 `(MA(C,M1)+MA(C,M2)+MA(C,M3)+MA(C,M4))/4`，默认 `M1=5,M2=10,M3=20,M4=60`。
2. 构建 N 型上涨与趋势项：采用多头均线排列与均线斜率为正、并结合“回调后再创高/近期突破”替代严格波峰波谷判定，兼顾稳定性与可实现性。
3. KDJ 采用标准 `RSV/K/D/J` 计算，筛选 `J < 13`。
4. 缩量回调：要求回调期间成交量显著低于均量、回撤不深并识别多种“完美图形”（小阴、小十字、下影较长、贴均线企稳等）。
5. 顶部无量优化：限制新高日不出现巨量冲顶；加入“假阴真阳”（O > C 且 C > REF(C,1)）与“大绿帽”（长上影）识别，用于偏好或剔除。
6. 知行趋势线判定：白线金叉黄线后，放量上穿黄线，且金叉后不有效跌破黄线。
7. 无异常涨停：近 N 日剔除“一字涨停/近似涨停”的异常样本。

### 主要代码（通达信选股公式）
```text
{ 参数区 }
N_HIGH:=20; N_PULL:=10; N_SLOPE:=5; N_KDJ:=9; N_HOLD:=5; N_VOL:=5; N_ZT:=20;
M1:=5; M2:=10; M3:=20; M4:=60;

{ 知行趋势线 }
ZX_WHITE:=EMA(EMA(C,10),10);
ZX_YELLOW:=(MA(C,M1)+MA(C,M2)+MA(C,M3)+MA(C,M4))/4;

{ KDJ }
RSV:=(C-LLV(L,N_KDJ))/(HHV(H,N_KDJ)-LLV(L,N_KDJ))*100;
K:=SMA(RSV,3,1);
D:=SMA(K,3,1);
J:=3*K-2*D;

{ 均线与趋势（多头+斜率）}
MA5:=MA(C,5); MA10:=MA(C,10); MA20:=MA(C,20); MA60:=MA(C,60);
MA_MULTI:=MA5>MA10 AND MA10>MA20 AND C>MA5 AND C>MA10 AND C>MA20;
MA_SLOPE:=MA20>REF(MA20,1) AND MA60>=REF(MA60,1);

{ 近端突破 / N 型上涨替代：回调后再上攻并突破近期高点 }
PULL_BACK:=COUNT(C<MA10,N_PULL)>=1 AND COUNT(C>=MA10,3)>=2; { 回调后重回均线 }
BREAK_HIGH:=C>HHV(C,N_HIGH)*0.995; { 接近新高/突破新高 }
N_PAT:=MA_MULTI AND MA_SLOPE AND PULL_BACK AND BREAK_HIGH;

{ 缩量回调与完美图形（多形态）}
VOL_MA:=MA(V,N_VOL);
IS_SMALL_BODY:=ABS(C-O)/MAX(C,O)<0.02; { 小实体 }
LW_SHADOW:= (MIN(O,C)-L)/MAX(C,O) > 0.02; { 明显下影 }
DOJI:=ABS(C-O)/MAX(C,O)<0.005 AND (H-L)/MAX(C,O)>0.02; { 十字星 }
NEAR_AVG_LINE:=ABS(C-MA10)/MA10<0.01; { 贴均线企稳 }
PULL_VOL_SHRINK:=V<VOL_MA*0.8; { 缩量 }
PULL_DEPTH_OK:=(HHV(C,N_PULL)-C)/HHV(C,N_PULL) < 0.08; { 回撤不深 }
PERFECT_PULL:= (IS_SMALL_BODY OR LW_SHADOW OR DOJI) AND NEAR_AVG_LINE AND PULL_VOL_SHRINK AND PULL_DEPTH_OK;

{ 顶部无量 + 假阴真阳 / 大绿帽识别 }
NEW_HI_VOL_OK:= IF(C=HHV(C,N_HIGH), V<VOL_MA*2.5, 1); { 新高日不巨量 }
FAKE_BEAR_BULL:= O>C AND C>REF(C,1); { 假阴真阳 }
BIG_GREEN_HAT:= (H-MAX(O,C))/MAX(C,O) > 0.03; { 长上影判定 }
TOP_OK:=NEW_HI_VOL_OK AND (FAKE_BEAR_BULL OR NOT(BIG_GREEN_HAT));

{ 知行趋势线综合：白线金叉 + 放量上黄线 + 不跌破黄线 }
WG_CROSS:=CROSS(ZX_WHITE,ZX_YELLOW);
BAR_CROSS:=BARSLAST(WG_CROSS);
PASS_YLW_VOL:= C>ZX_YELLOW AND V>MA(V,5)*1.2;
NOT_BRK_YEL:= EVERY(L>=ZX_YELLOW, MIN(BAR_CROSS, N_HOLD)+1);
ZX_OK:= WG_CROSS AND PASS_YLW_VOL AND NOT_BRK_YEL;

{ 无异常涨停（近 N_ZT 日剔除一字或近似涨停）}
NEAR_LIMIT_UP:= (C/REF(C,1)>=1.095 AND H=C); { 近似涨停且封住 }
ONE_WORD_LIMIT:= O=C AND H=C AND C/REF(C,1)>=1.095; { 一字板 }
NO_ABNORMAL_ZT:= COUNT(NEAR_LIMIT_UP OR ONE_WORD_LIMIT, N_ZT)=0;

{ KDJ 约束 }
KDJ_OK:= J<13;

{ 组合信号 }
XUAN_GU:= N_PAT AND PERFECT_PULL AND TOP_OK AND ZX_OK AND NO_ABNORMAL_ZT AND KDJ_OK;

XG: XUAN_GU;
```

### 遇到的问题与解决方法
- 严格的 N 型波峰波谷判定在通达信公式中实现成本较高，采用“回调后再上攻+突破近高”的可实现近似替代，稳定性更好。
- “顶部无量”与图形学的判定口径多样，本版以体量阈值与影线比例近似，后续可根据盘后复盘样本微调参数。
- “无异常涨停”在不同交易制度下阈值略有差异，采用 9.5%～10% 近似；如需更精细可引入是否 ST/科创板等差异化阈值。

### 后续优化建议
- 引入更精细的波段分型（如唐奇安或笔划分）以提升 N 型识别准确度。
- 动态体量阈值（以分位数代替固定倍数）适配不同成交水平的个股。
- 针对不同市场/属性（主板、创业板、ST）设定差异化的“涨停识别”阈值。
- 将“白线金叉后不破黄线”的持有期校验与回撤容忍度做参数化（如容许黄线下方 1% 假跌破）。


## 2024-12-19 回测周期界面升级

### 问题描述
用户希望将回测周期从简单的数值+单位选择器改为具体的日期范围选择器（从某年某月某天到某年某月某天），同时保留快捷的回测周期选项。

### 解决方案
1. **HTML界面改造**：
   - 将原来的数值输入框+单位选择器改为两个日期输入框
   - 添加开始日期和结束日期的标签
   - 保留快捷周期按钮，但改为基于天数的预设

2. **CSS样式优化**：
   - 新增日期范围选择器样式（`.date-range-group`）
   - 优化日期输入框样式（`.date-input`）
   - 美化快捷按钮样式，增加悬停和激活效果
   - 添加日期范围信息显示区域

3. **JavaScript逻辑更新**：
   - 新增 `validateDateRange()` 方法验证日期范围
   - 新增 `bindDateRangeEvents()` 绑定日期输入事件
   - 新增 `initializeDateRange()` 初始化默认日期
   - 新增 `updateDateRangeInfo()` 实时显示周期信息
   - 更新 `bindPeriodPresetEvents()` 支持基于天数的预设
   - 更新 `getStrategyConfig()` 返回具体的日期字符串

### 主要代码变更

#### HTML结构
```html
<div class="date-range-group">
    <div class="date-input-group">
        <label for="startDate" class="date-label">开始日期</label>
        <input type="date" id="startDate" class="form-control date-input">
    </div>
    <div class="date-separator">至</div>
    <div class="date-input-group">
        <label for="endDate" class="date-label">结束日期</label>
        <input type="date" id="endDate" class="form-control date-input">
    </div>
</div>
```

#### JavaScript核心方法
```javascript
// 日期范围验证
validateDateRange(startDate, endDate) {
    // 检查日期格式、范围合理性、不能超过今天等
}

// 实时更新周期信息
updateDateRangeInfo() {
    // 计算并显示回测周期（年/月/天）
}

// 快捷按钮事件
bindPeriodPresetEvents() {
    // 基于天数计算日期范围并更新输入框
}
```

### 功能特性
- ✅ **精确日期选择**：支持选择具体的开始和结束日期
- ✅ **快捷周期按钮**：30天、3个月、半年、1年、3年、5年
- ✅ **实时周期显示**：自动计算并显示回测周期长度
- ✅ **输入验证**：确保日期范围合理（1天-10年）
- ✅ **响应式设计**：适配不同屏幕尺寸
- ✅ **用户体验**：按钮状态同步、悬停效果、错误提示

### 测试结果
- ✅ 日期范围选择功能正常
- ✅ 快捷按钮一键设置功能正常
- ✅ 日期验证和错误提示正常
- ✅ 周期信息实时更新正常
- ✅ 样式和交互效果正常

### 后续优化建议
1. 可以考虑添加更多预设选项（如季度、半年等）
2. 可以添加日期范围的历史记录功能
3. 可以添加工作日/自然日的选择选项

## 2025-10-08 B2选股规则小幅优化

### 问题描述
在现有 B2 选股条件基础上，补充“当日收盘价大于黄线97%价位”的约束，进一步过滤贴线但略弱的样本。

### 解决方案
- 在 `src/stocks/docs/通达信代码.md` 的 B2 选股中新增条件：`条件8 := CLOSE > ZX_YELLOW*0.97;`
- 将 `条件8` 并入综合条件：`选股: ... AND 条件8;`

### 主要代码变更
```text
条件8 := CLOSE > ZX_YELLOW*0.97;                  { 收盘价高于黄线97% }
选股: 条件1 AND 条件2 AND 条件3 AND 条件4 AND 条件5 AND 条件6 AND 条件7 AND 条件8;
```

### 影响评估与后续
- 该条件强化了价格相对黄线的强势要求，略微降低命中率，预期提升样本质量。
- 后续可考虑将 97% 参数化（如 95%~99% 可调）以便回测优化。

## 2025-10-08 B1选股规则新增

### 问题描述
根据需求补充 B1 选股公式，条件：前2日J值在(13,55)、当日J<13；当日量<前2日量且昨日量<前两日量；白线>黄线；收盘价>黄线97%。

### 解决方案
- 在 `src/stocks/docs/通达信代码.md` 的 “3、B1选股” 段落中实现完整公式，与 B2 保持同一套参数与变量命名。

### 主要代码变更
```text
P1:=5; P2:=10; P3:=20; P4:=60;
ZX_WHITE:=EMA(EMA(C,10),10);
ZX_YELLOW:=(MA(C,P1)+MA(C,P2)+MA(C,P3)+MA(C,P4))/4;
N := 9; M1 := 3; M2 := 3;
RSV := (CLOSE - LLV(LOW, N)) / (HHV(HIGH, N) - LLV(LOW, N)) * 100;
K := SMA(RSV, M1, 1);
D := SMA(K, M2, 1);
J := 3 * K - 2 * D;

条件1 := REF(J, 2) > 13 AND REF(J, 2) < 55;       { 前2日J值介于(13,55) }
条件2 := J < 13;                                   { 当日J值小于13 }
条件3 := VOL < REF(VOL, 2);                        { 当日成交量小于前2日 }
条件4 := REF(VOL, 1) < REF(VOL, 2);                { 昨日成交量小于前两日 }
条件5 := ZX_WHITE > ZX_YELLOW;                     { 白线大于黄线 }
条件6 := CLOSE > ZX_YELLOW * 0.97;                 { 收盘价高于黄线97% }

选股: 条件1 AND 条件2 AND 条件3 AND 条件4 AND 条件5 AND 条件6;
```

### 影响评估与后续
- 量能递减强化了缩量回踩的筛选思路，与白黄线强弱配合使用。
- 若需更细颗粒度控制，可将 13、55、0.97 参数化以便回测优化。

## 2025-10-08 B1新增30日斜率条件

### 问题描述
为 B1 选股增加“白线、黄线30日趋势斜率向上”的过滤条件。

### 解决方案
- 采用 30 日差分近似斜率：`(当前值 - 30日前值) / 30`，判断为正即向上。
- 在 `src/stocks/docs/通达信代码.md` 的 B1 中新增：
```text
SLOPE_W := (ZX_WHITE - REF(ZX_WHITE, 30)) / 30;
SLOPE_Y := (ZX_YELLOW - REF(ZX_YELLOW, 30)) / 30;
条件7 := SLOPE_W > 0 AND SLOPE_Y > 0;
选股: ... AND 条件7;
```

### 影响与建议
- 用差分表示方向，计算稳定、易理解；若需更平滑可改用 `SLOPE(EMA(...),30)` 或对斜率再做平滑。
- 参数 30 可抽为变量便于回测。

## 2025-10-08 B1斜率条件参数化与平滑

### 问题描述
将 B1 “白/黄线30日斜率向上”改为可调周期与轻度平滑，增强可回测性与稳定性。

### 解决方案
- 新增参数：`SP`（斜率周期，默认30）、`SS`（平滑周期，默认3）。
- 计算方式：以差分近似斜率并用 EMA 平滑。
- 代码位置：`src/stocks/docs/通达信代码.md` → B1 段落。
```text
SP:=30; SS:=3;
SLOPE_W_RAW := (ZX_WHITE - REF(ZX_WHITE, SP)) / SP;
SLOPE_Y_RAW := (ZX_YELLOW - REF(ZX_YELLOW, SP)) / SP;
SLOPE_W := EMA(SLOPE_W_RAW, SS);
SLOPE_Y := EMA(SLOPE_Y_RAW, SS);
条件7 := SLOPE_W > 0 AND SLOPE_Y > 0;
选股: ... AND 条件7;
```

### 影响与建议
- 参数化便于做 SP∈[15,45]、SS∈[2,5] 网格回测，寻找更优组合。
- 若需进一步抗噪，可对 `ZX_YELLOW` 改为更平滑的均值或提高 SS。 

## 2025-10-08 B1阈值参数化（J与黄线比例）

### 问题描述
将 B1 中固定阈值 `J<13` 与 `收盘>黄线*0.97` 改为可调参数，便于回测优化。

### 解决方案
- 新增参数：`J_LOW`（默认13）、`J_HIGH`（默认55）、`YELLOW_RATIO`（默认0.97）。
- 替换条件：
```text
条件1 := REF(J, 2) > J_LOW AND REF(J, 2) < J_HIGH AND REF(J, 1) > J_LOW AND REF(J, 1) AND REF(J, 2) > REF(J, 1);
条件2 := J < J_LOW;
条件6 := CLOSE > ZX_YELLOW * YELLOW_RATIO;
```
- 代码位置：`src/stocks/docs/通达信代码.md` → B1 段落。

### 影响与建议
- 可在回测中网格搜索 `J_LOW∈[10,20]`、`J_HIGH∈[45,65]`、`YELLOW_RATIO∈[0.95,1.00]`。
- 若样本偏弱可上调 `YELLOW_RATIO`，若命中率过低可适当放宽 `J_LOW`。 

## 2025-10-08 B2斜率与阈值参数化

### 问题描述
为 B2 选股加入趋势斜率（参数化+平滑）条件，并将 J 与黄线比例阈值参数化，以便统一与 B1 的口径并支持回测优化。

### 解决方案
- 新增参数：`SP`（斜率周期，默认30）、`SS`（斜率平滑周期，默认3）、`J_LOW`（默认13）、`J_HIGH`（默认55）、`YELLOW_RATIO`（默认0.97）。
- 新增斜率条件：
```text
SLOPE_W_RAW := (ZX_WHITE - REF(ZX_WHITE, SP)) / SP;
SLOPE_Y_RAW := (ZX_YELLOW - REF(ZX_YELLOW, SP)) / SP;
SLOPE_W := EMA(SLOPE_W_RAW, SS);
SLOPE_Y := EMA(SLOPE_Y_RAW, SS);
条件9 := SLOPE_W > 0 AND SLOPE_Y > 0;
```
- 参数化原约束：
```text
条件1 := REF(J, 2) < J_LOW;
条件2 := J < J_HIGH;
条件8 := CLOSE > ZX_YELLOW * YELLOW_RATIO;
```
- 综合条件并入 `条件9`。
- 代码位置：`src/stocks/docs/通达信代码.md` → B2 段落。

### 影响与建议
- 与 B1 统一参数使回测对比更公平，可网格搜索 `SP∈[15,45]`、`SS∈[2,5]`、`J_LOW/J_HIGH` 与 `YELLOW_RATIO`。
- 若样本质量仍偏弱，可上调 `YELLOW_RATIO` 或提高 `SP`；若命中率偏低，可下调 `SP` 或放宽 `J_LOW/J_HIGH`。 

## 2025-10-08 B1/B2新增“最近山顶无长上/下影”条件

### 问题描述
在 B1 与 B2 中增加“当前收盘日最近的股价山顶没有长上影、长下影线”的过滤，剔除尖顶或极端影线的风险样本。

### 解决方案
- 参数化控制：
  - `TOP_N`（默认20）：寻找最近山顶（近 TOP_N 日内最高价）
  - `W_UP`（默认0.03）：长上影阈值（相对价比）
  - `W_LO`（默认0.03）：长下影阈值（相对价比）
- 判定口径：定位近 TOP_N 内最高价所处K线 `TOP_BAR`，计算其上影、下影相对比例：
```text
TOP_BAR := BARSLAST(H=HHV(H, TOP_N));
TOP_UP := (REF(H,TOP_BAR)-MAX(REF(O,TOP_BAR),REF(C,TOP_BAR)))/MAX(REF(C,TOP_BAR),REF(O,TOP_BAR));
TOP_LO := (MIN(REF(O,TOP_BAR),REF(C,TOP_BAR))-REF(L,TOP_BAR))/MAX(REF(C,TOP_BAR),REF(O,TOP_BAR));
条件 := TOP_UP < W_UP AND TOP_LO < W_LO;
```
- 并入综合条件：
  - B1：新增 `条件8`（无长影），并入 `选股`
  - B2：新增 `条件10`（无长影），并入 `选股`
- 代码位置：`src/stocks/docs/通达信代码.md` → B1、B2 段落。

### 影响与建议
- 该条件有助于过滤尖顶或针刺形态，提升形态稳定性。
- 可根据风格调整：若过严，可放宽 `W_UP/W_LO` 至 0.04~0.05；若仍有噪声，可缩小 `TOP_N` 或提高阈值。 

## 2025-10-10 B2新增量能过滤：当日 > 5日均量的1.8倍

### 问题描述
为 B2 增加更强的放量确认：当日成交量需显著高于近5日均量，以过滤无量上冲和脉冲。

### 解决方案
- 新增条件：
```text
条件10 := VOL > 1.8 * MA(VOL, 5);
```
- 并入综合选股表达式：原选股 AND 条件10。
- 代码位置：`src/stocks/docs/通达信代码.md` → B2 段落。

### 影响与调参建议
- 对应更强的量能确认，样本更集中，命中率优先于覆盖率。
- 若标的波动较小或普遍低量，可下调系数至 1.5~1.6。 

## 2025-10-10 B1新增均量递减过滤（7日>5日>3日>当日）

### 问题描述
为 B1 增加“前7日、前5日、前3日、今日日均成交量递减”的约束，以强化缩量回踩与量能结构的稳定性。

### 解决方案
- 新增条件：
```text
条件8 := MA(VOL,7) > MA(VOL,5) AND MA(VOL,5) > MA(VOL,3) AND MA(VOL,3) > VOL;
```
- 并入综合选股表达式：原选股 AND 条件8。
- 代码位置：`src/stocks/docs/通达信代码.md` → B1 段落。

### 影响与调参建议
- 增强样本的量能结构要求，可能降低命中率、提升质量。
- 若普遍低量或波动较小，可放宽为 `MA(V,7) > MA(V,5) > MA(V,3)`（不比较当日）。 

## 2025-10-10 B1条件1调整：J值三日递减+区间约束

### 问题描述
需将 B1 条件1修改为：前3日（含今天）J值严格递减，且前2日 J 值位于区间 [J_LOW, J_HIGH] 内。

### 解决方案
- 修改条件表达式：
```text
条件1 := REF(J, 2) > REF(J, 1) AND REF(J, 1) > J AND REF(J, 2) > J AND
        REF(J, 2) > J_LOW AND REF(J, 2) < J_HIGH AND
        REF(J, 1) > J_LOW AND REF(J, 1) < J_HIGH;
```
- 文件位置：`src/stocks/docs/通达信代码.md` → B1 段落。

### 影响与说明
- “三日递减”更强调连续回落后的低位J，配合 J_LOW 约束增强拣底质量。
- 若需放宽，可改为“非上升”关系（≥/≤），或仅要求 `REF(J,2)>REF(J,1)` 与 `J<J_LOW`。 

## 2025-10-10 B1条件1更新：前5日J递减 + 当日J<J_LOW

### 问题描述
将 B1 的条件1调整为：前5日 J 值严格递减（REF(J,4)>REF(J,3)>REF(J,2)>REF(J,1)>J），同时要求当日 J < J_LOW。

### 解决方案
- 修改 `src/stocks/docs/通达信代码.md` 中 B1 条件1 为：
```text
条件1 := REF(J, 4) > REF(J, 3) AND REF(J, 3) > REF(J, 2) AND REF(J, 2) > REF(J, 1) AND REF(J, 1) > J AND J < J_LOW;
```

### 影响与说明
- 更强调连续 5 日动能衰减后的低位确认，减少过早介入。
- 若需放宽，可将“严格递减”改为“非上升”（≥/≤），或降低至3日递减以增加样本量。 
