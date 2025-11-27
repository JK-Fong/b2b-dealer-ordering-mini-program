# 商品列表优化验证清单

## 优化内容

### 1. 去除起订量逻辑 ✅

**修改前**：
- 数量步进器每次 +/- 起订量（如 10 件）
- 数量必须是起订量的倍数
- 显示"起订: X件"提示

**修改后**：
- 数量步进器每次 +/- 1 件
- 数量可以是任意正整数
- 移除起订量提示文字

**代码变更**：
```javascript
// 修改前
changeQuantity(product, -product.min_order_qty)
changeQuantity(product, product.min_order_qty)

// 修改后
changeQuantity(product, -1)
changeQuantity(product, 1)
```

---

### 2. 调整UI字体和组件大小 ✅

#### 字体大小调整

| 元素 | 修改前 | 修改后 | 缩小幅度 |
| :--- | :---: | :---: | :---: |
| 客户名称 | 32rpx | **28rpx** | -12.5% |
| 退出按钮 | 64x64rpx | **56x56rpx** | -12.5% |
| 搜索框高度 | 80rpx | **68rpx** | -15% |
| 搜索按钮宽度 | 120rpx | **100rpx** | -16.7% |
| 商品图片 | 200x200rpx | **160x160rpx** | -20% |
| 商品名称 | 32rpx | **28rpx** | -12.5% |
| 商品规格 | 24rpx | **22rpx** | -8.3% |
| 价格符号 | 28rpx | **24rpx** | -14.3% |
| 价格金额 | 44rpx | **36rpx** | -18.2% |
| 库存标签 | 22rpx | **20rpx** | -9.1% |
| 数量控制按钮 | 56x56rpx | **48x48rpx** | -14.3% |
| 数量输入框 | 72rpx | **64rpx** | -11.1% |
| 加入按钮文字 | 26rpx | **24rpx** | -7.7% |
| 购物车图标 | 56rpx | **48rpx** | -14.3% |
| 购物车总价 | 40rpx | **34rpx** | -15% |
| 去结算按钮文字 | 30rpx | **28rpx** | -6.7% |

#### 组件尺寸调整

| 组件 | 修改前 | 修改后 | 缩小幅度 |
| :--- | :---: | :---: | :---: |
| 商品卡片内边距 | 24rpx | **20rpx** | -16.7% |
| 商品卡片间距 | 24rpx | **20rpx** | -16.7% |
| 商品卡片圆角 | 24rpx | **20rpx** | -16.7% |
| 图片圆角 | 16rpx | **12rpx** | -25% |
| 购物车栏高度 | 112rpx | **100rpx** | -10.7% |
| 购物车栏圆角 | 56rpx | **50rpx** | -10.7% |

---

### 3. 修复"去结算"按钮显示问题 ✅

**问题分析**：
- 原因：购物车栏整体设置了 `@click="goToCart"`，导致点击"去结算"按钮也会跳转到购物车页面
- 结果：用户无法点击"去结算"按钮进入结算页面

**解决方案**：
```vue
<!-- 修改前 -->
<view class="cart-bar" @click="goToCart">
  ...
  <view class="checkout-btn">
    <text class="checkout-text">去结算</text>
  </view>
</view>

<!-- 修改后 -->
<view class="cart-bar" @click="goToCart">
  ...
  <view class="checkout-btn" @click.stop="goToCheckout">
    <text class="checkout-text">去结算</text>
  </view>
</view>
```

**关键点**：
1. 添加 `@click.stop` 阻止事件冒泡
2. 添加 `goToCheckout()` 方法跳转到结算页面

---

## 验证清单

### 功能验证

- [ ] **去除起订量逻辑**
  - [ ] 点击 `-` 按钮，数量减少 1
  - [ ] 点击 `+` 按钮，数量增加 1
  - [ ] 手动输入任意数量（如 3、5、7），不会被强制调整为倍数
  - [ ] 不再显示"起订: X件"提示文字

- [ ] **去结算按钮功能**
  - [ ] 购物车有商品时，底部显示购物车栏
  - [ ] 点击购物车栏左侧区域，跳转到购物车页面
  - [ ] 点击"去结算"按钮，跳转到结算页面（而非购物车页面）
  - [ ] 购物车为空时，购物车栏不显示

### UI验证

- [ ] **字体大小**
  - [ ] 商品名称字号适中，不会过大
  - [ ] 价格金额字号适中，不会过大
  - [ ] "加入"按钮文字大小合适
  - [ ] 整体视觉协调，不会显得拥挤或过大

- [ ] **组件尺寸**
  - [ ] 商品图片尺寸适中（160x160rpx）
  - [ ] 商品卡片间距合理（20rpx）
  - [ ] 数量控制按钮大小合适（48x48rpx）
  - [ ] 购物车栏高度合适（100rpx）

- [ ] **布局对齐**
  - [ ] 商品列表居中显示
  - [ ] 商品卡片内容垂直居中
  - [ ] 价格和操作按钮对齐
  - [ ] 购物车栏内容对齐

### 交互验证

- [ ] **点击反馈**
  - [ ] 点击商品卡片有缩放效果
  - [ ] 点击按钮有视觉反馈
  - [ ] 搜索框聚焦时边框变绿

- [ ] **数量控制**
  - [ ] 数量为 0 时，`-` 按钮置灰
  - [ ] 数量达到库存上限时，提示"已达最大库存"
  - [ ] 库存为 0 时，"加入"按钮置灰

---

## 测试场景

### 场景1：添加商品到购物车

1. 打开商品页
2. 选择一个商品，点击 `+` 按钮 3 次
3. 验证数量显示为 3
4. 点击"加入"按钮
5. 验证购物车徽章显示数量
6. 验证购物车栏显示总价

**预期结果**：
- ✅ 数量正确增加（每次 +1）
- ✅ 购物车徽章显示正确数量
- ✅ 购物车栏显示正确总价

---

### 场景2：点击"去结算"按钮

1. 打开商品页
2. 添加商品到购物车
3. 点击底部购物车栏的"去结算"按钮
4. 验证是否跳转到结算页面

**预期结果**：
- ✅ 跳转到结算页面（`/pages/checkout/checkout`）
- ❌ 不应跳转到购物车页面（`/pages/cart/cart`）

---

### 场景3：点击购物车栏左侧区域

1. 打开商品页
2. 添加商品到购物车
3. 点击底部购物车栏的左侧区域（购物车图标或总价）
4. 验证是否跳转到购物车页面

**预期结果**：
- ✅ 跳转到购物车页面（`/pages/cart/cart`）

---

### 场景4：手动输入任意数量

1. 打开商品页
2. 点击数量输入框
3. 手动输入数量 5
4. 点击输入框外部（失焦）
5. 验证数量是否保持为 5

**预期结果**：
- ✅ 数量保持为 5（不会被调整为起订量的倍数）

---

### 场景5：库存不足

1. 打开商品页
2. 找到一个库存为 0 的商品
3. 验证"加入"按钮是否置灰
4. 点击"加入"按钮
5. 验证是否无反应

**预期结果**：
- ✅ "加入"按钮置灰
- ✅ 点击无反应

---

## 代码对比

### 起订量逻辑移除

#### changeQuantity 方法

```javascript
// 修改前
changeQuantity(product, delta) {
  let newQty = product.qty + delta;
  if (newQty < 0) newQty = 0;
  if (newQty > product.stock && product.stock > 0) {
    newQty = product.stock;
    uni.showToast({ title: '已达最大库存', icon: 'none' });
  }
  product.qty = newQty;
  this.updateCart(product);
}

// 修改后（相同，但调用时 delta 从 min_order_qty 改为 1）
changeQuantity(product, delta) {
  let newQty = product.qty + delta;
  if (newQty < 0) newQty = 0;
  if (newQty > product.stock && product.stock > 0) {
    newQty = product.stock;
    uni.showToast({ title: '已达最大库存', icon: 'none' });
  }
  product.qty = newQty;
  this.updateCart(product);
}
```

#### validateQuantity 方法

```javascript
// 修改前
validateQuantity(product) {
  if (product.qty < 0 || isNaN(product.qty)) {
    product.qty = 0;
  }
  if (product.qty > product.stock && product.stock > 0) {
    product.qty = product.stock;
    uni.showToast({ title: '已达最大库存', icon: 'none' });
  }
  // 检查起订量倍数
  if (product.qty % product.min_order_qty !== 0) {
    product.qty = Math.floor(product.qty / product.min_order_qty) * product.min_order_qty;
    uni.showToast({ title: `数量必须是${product.min_order_qty}的倍数`, icon: 'none' });
  }
  this.updateCart(product);
}

// 修改后（移除起订量倍数检查）
validateQuantity(product) {
  if (product.qty < 0 || isNaN(product.qty)) {
    product.qty = 0;
  }
  if (product.qty > product.stock && product.stock > 0) {
    product.qty = product.stock;
    uni.showToast({ title: '已达最大库存', icon: 'none' });
  }
  this.updateCart(product);
}
```

#### addToCart 方法

```javascript
// 修改前
addToCart(product) {
  if (product.stock <= 0) return;
  if (product.qty <= 0) {
    product.qty = product.min_order_qty;  // 默认起订量
  }
  this.updateCart(product);
  uni.showToast({ title: '已加入购物车', icon: 'success' });
}

// 修改后
addToCart(product) {
  if (product.stock <= 0) return;
  if (product.qty <= 0) {
    product.qty = 1;  // 默认 1 件
  }
  this.updateCart(product);
  uni.showToast({ title: '已加入购物车', icon: 'success' });
}
```

### 去结算按钮修复

```vue
<!-- 修改前 -->
<view class="cart-bar" @click="goToCart">
  <view class="cart-left">...</view>
  <view class="cart-right">
    <view class="checkout-btn">
      <text class="checkout-text">去结算</text>
    </view>
  </view>
</view>

<!-- 修改后 -->
<view class="cart-bar" @click="goToCart">
  <view class="cart-left">...</view>
  <view class="cart-right">
    <view class="checkout-btn" @click.stop="goToCheckout">
      <text class="checkout-text">去结算</text>
    </view>
  </view>
</view>
```

```javascript
// 新增方法
goToCheckout() {
  if (this.$store.getters.cartCount > 0) {
    uni.navigateTo({ url: '/pages/checkout/checkout' });
  }
}
```

---

## 优化总结

### 1. 去除起订量逻辑

**影响范围**：
- 数量步进器（+/- 按钮）
- 数量验证逻辑
- 加入购物车默认数量

**优势**：
- ✅ 用户可以灵活选择任意数量
- ✅ 简化操作流程
- ✅ 减少错误提示

### 2. 调整UI字体和组件大小

**优化幅度**：
- 字体大小平均缩小 **12%**
- 组件尺寸平均缩小 **15%**

**优势**：
- ✅ 视觉更精致
- ✅ 信息密度更高
- ✅ 一屏显示更多内容

### 3. 修复去结算按钮

**问题根源**：
- 事件冒泡导致点击"去结算"按钮时触发父元素的点击事件

**解决方案**：
- 使用 `@click.stop` 阻止事件冒泡
- 添加独立的 `goToCheckout()` 方法

**优势**：
- ✅ 用户可以直接进入结算页面
- ✅ 提升购物体验

---

## 后续建议

1. **添加商品详情页**
   - 点击商品卡片查看详情
   - 显示更多商品信息

2. **添加购物车编辑功能**
   - 在购物车页面修改数量
   - 删除商品

3. **添加搜索历史**
   - 记录搜索关键词
   - 快速搜索

4. **添加商品筛选**
   - 按价格筛选
   - 按库存筛选

---

## 版本历史

| 版本 | 日期 | 说明 |
| :--- | :--- | :--- |
| v2.1 | 2025-11-26 | 去除起订量逻辑，调整UI尺寸，修复去结算按钮 |
| v2.0 | 2025-11-26 | 现代化UI设计，参考WeUI规范 |
| v1.1 | 2025-11-26 | 修复样式、中文化、居中对齐 |
| v1.0 | 2025-11-26 | 初始版本 |
