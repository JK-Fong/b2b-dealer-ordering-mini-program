# B2B 经销商订货小程序 (UniApp + Mock API)

本项目是基于 [B2B 经销商订货小程序产品需求文档 (PRD)](https://github.com/JK-Fong/b2b-dealer-ordering-mini-program/blob/master/PRD.md) 实现的一个 UniApp 示例项目，旨在演示如何使用 UniApp 框架结合 Mock 数据实现 PRD 中定义的**全实时模式**核心业务逻辑和交互规范。

## 核心技术栈

*   **前端框架**: UniApp (Vue 2)
*   **数据模拟**: 本地 Mock API (src/mock/mockData.js)
*   **状态管理**: Vuex
*   **代码托管**: GitHub

## 功能实现概览

本项目严格遵循 PRD 中的核心逻辑，主要实现了以下功能模块：

| 模块 | 核心逻辑实现 | PRD 对应章节 |
| :--- | :--- | :--- |
| **登录** | 手机号+验证码登录，模拟 `CheckUser` 接口校验授权用户。 | 2.1 |
| **商品列表** | 模拟 `Product.List` 获取商品，并实时调用 `Product.Stock` 获取库存。库存 <= 0 时，“加入购物车”按钮置灰。 | 2.2 |
| **购物车** | 支持批量修改数量、删除。数量校验（起订量倍数）。 | 2.3 |
| **结算** | **资金预检**：并发调用 `GetStock` 和 `GetBalance`。若总可用资金 < 订单总额，提交按钮置灰并提示缺口。 | 2.3 |
| **下单** | 模拟 `Order.Create` 事务级操作，包含库存/余额校验，并返回订单号。 | 2.4 |
| **账户查询** | 模拟 `Fund.Balance` 获取余额/授信，`GetTransactionList` 获取资金流水。 | 2.5 |
| **订单管理** | 模拟 `Order.List` 获取历史订单，并根据状态显示“取消订单”或“申请退货”按钮。 | 2.6 |
| **代客下单** | 业务员登录后，可模拟 `Dealer.List` 选择经销商，后续所有操作（查询、下单）均携带 `Target_Dealer_ID`。 | 2.7 |
| **全局规则** | 实现了接口异常处理规范（模拟 5% 概率的“系统维护中”提示）。 | 1.1 |

## Mock 数据说明

所有数据和 API 逻辑均在 `src/mock/mockData.js` 中定义。

### 模拟用户

| 手机号 | 身份 | 备注 |
| :--- | :--- | :--- |
| `13800001111` | 普通经销商 | 默认登录账号，用于测试订货流程。 |
| `13900002222` | 业务员 | 用于测试代客下单功能。 |

### 资金预检测试

默认经销商 `13800001111` 拥有：
*   可用余额: ¥12,000.50
*   授信额度: ¥50,000.00
*   **总可用资金**: ¥62,000.50

可以通过调整购物车商品数量，使订单总额超过此金额来测试**“账户余额不足”**的提示。

## 运行项目

### 1. 安装依赖

```bash
# 确保已安装 Node.js 和 npm
npm install -g @vue/cli @vue/cli-init
# 进入项目目录
cd b2b-dealer-ordering-mini-program
# 安装项目依赖
npm install
```

### 2. 运行开发环境

本项目主要针对小程序端进行开发，推荐使用 HBuilderX 导入项目后运行到微信开发者工具。

如果需要在命令行运行，可以执行：

```bash
# 运行到 H5 (仅用于快速预览)
npm run dev:h5

# 运行到微信小程序 (需要配置微信开发者工具路径)
npm run dev:mp-weixin
```

## 交互与规则实现细节

### 异常处理

在 `src/utils/api.js` 中，`request` 函数模拟了 5% 的概率抛出异常（模拟超时或 5xx 错误），此时前端会统一返回 `系统维护中，服务暂时不可用` 的提示，符合 PRD 1.1 规范。

### 单点登录

在 `src/store/index.js` 中，登录成功后会将 `token` 和 `customer_id` 设置到全局 API 封装中，并在 `src/pages/login/login.vue` 的 `onLoad` 中检查登录状态，实现自动登录和未登录跳转。互踢机制通过 `api.js` 中的 `globalToken` 模拟。

### 代客下单

在 `src/pages/sales/dealer-select.vue` 中，业务员选择经销商后，`src/store/index.js` 会设置 `targetDealer`，并更新 `api.js` 中的 `globalTargetDealerId`。所有后续 API 调用（如 `orderCreate`）都会通过 `getGlobalCustomerId()` 自动携带正确的客户 ID，实现身份模拟。
