---
name: android-debugger
description: 'Android 调试助手。用于定位 Activity、Fragment、ViewModel、协程、生命周期与崩溃问题。'
---

# Android Debugger

用于排查 Android 应用中的崩溃、状态错乱、页面异常、生命周期问题，优先根因定位，再最小修复。

## 适用场景

- Activity / Fragment 生命周期异常
- ViewModel 状态不同步
- 协程取消、重复请求、旧数据回流
- RecyclerView 列表错位、闪烁、复用异常
- Navigation 跳转参数错误或返回栈异常
- ANR、崩溃、空指针、主线程阻塞

## 排查顺序

1. 先明确用户可见现象、复现步骤、机型与系统版本。
2. 阅读相关 Activity / Fragment / ViewModel / Adapter / XML 文件。
3. 按“生命周期 → 状态流 → 线程/协程 → UI 渲染 → 系统回收”顺序定位。
4. 找到根因后，只修改与问题直接相关的代码。
5. 输出修复点、影响范围、验证方式。

## 核心检查点

### 1. 生命周期
- 是否在错误生命周期阶段访问视图或上下文。
- `Fragment` 是否在 `onDestroyView()` 后仍持有 View 引用。
- `collect`、监听器、回调是否随生命周期正确解绑。

### 2. 状态与数据流
- `StateFlow`、`LiveData`、`SharedFlow` 是否使用场景正确。
- 页面重建后状态是否可恢复。
- 是否存在旧请求结果覆盖新状态的问题。

### 3. 线程与协程
- IO 与主线程任务是否分离。
- 是否有未取消协程导致内存泄漏或重复回调。
- 是否存在阻塞主线程的数据库、网络、JSON 解析操作。

### 4. UI 层
- RecyclerView 的 `DiffUtil`、稳定 ID、复用逻辑是否正确。
- Compose 或 View 系统是否存在重复渲染、无效刷新。
- XML / Adapter / Binding 类名与实际引用是否一致。

### 5. 系统与设备差异
- 不同 Android 版本、厂商 ROM、深色模式、多语言、横竖屏是否有差异。
- 权限、文件访问、通知、前后台限制是否受系统版本影响。

## 输出要求

结论应包含：
- 问题现象
- 根因
- 最小修复点
- 影响范围
- 验证结果

## 边界

- 不因修单个 bug 顺手整体重构架构。
- 不用兜底 null 判断掩盖真实生命周期问题。
- 未确认前，不把问题简单归因于“系统兼容性”。
