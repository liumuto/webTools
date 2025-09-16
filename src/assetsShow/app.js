// 数据存储
const state = {
	assets: [
		{ id: cryptoRandomId(), name: "招商中证白酒ETF", type: "场外基金", value: 20000, currency: "CNY", remark: "长期持有" },
		{ id: cryptoRandomId(), name: "贵州茅台", type: "股票", value: 35000, currency: "CNY", remark: "核心持仓" },
		{ id: cryptoRandomId(), name: "活期现金", type: "货币基金", value: 15000, currency: "CNY", remark: "备用金" },
		{ id: cryptoRandomId(), name: "券商ETF", type: "场内基金", value: 15000, currency: "CNY", remark: "备用金" },
	],
	filters: { type: "", min: "", max: "", keyword: "" }
};

function cryptoRandomId() {
	if (window.crypto?.randomUUID) return crypto.randomUUID();
	return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// 颜色映射
const typeColor = {
	"股票": "#06b6d4",
	"货币基金": "#a855f7",
	"场内基金": "#10b981",
	"场外基金": "#fff000",
	"其他": "#f59e0b",
};

// 为每个方块生成稳定且不同的颜色（基于名称/ID 哈希）
function colorFromString(input) {
	const str = String(input || '');
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 131 + str.charCodeAt(i)) >>> 0;
	}
	const hue = hash % 360;
	const saturation = 60; // 60%
	const lightness = 45; // 45%
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// 渲染表格
function renderTable() {
	const tbody = document.getElementById('table-body');
	const data = getFilteredAssets();
	tbody.innerHTML = '';
	for (const asset of data) {
		const tr = document.createElement('tr');
		tr.innerHTML = `
			<td>${escapeHtml(asset.name)}</td>
			<td>${escapeHtml(asset.type)}</td>
			<td>${formatCurrency(asset.value, asset.currency)}</td>
			<td>${escapeHtml(asset.currency || 'CNY')}</td>
			<td>${escapeHtml(asset.remark || '')}</td>
			<td class="action-links">
				<button class="btn btn-secondary" data-action="edit" data-id="${asset.id}">编辑</button>
				<button class="btn" data-action="delete" data-id="${asset.id}">删除</button>
			</td>
		`;
		tbody.appendChild(tr);
	}
}

function getFilteredAssets() {
	const { type, min, max, keyword } = state.filters;
	return state.assets.filter(a => {
		if (type && a.type !== type) return false;
		if (min !== '' && Number(a.value) < Number(min)) return false;
		if (max !== '' && Number(a.value) > Number(max)) return false;
		if (keyword && !(`${a.name}${a.remark || ''}`.includes(keyword))) return false;
		return true;
	});
}

function formatCurrency(v, currency) {
	const n = Number(v) || 0;
	return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: currency || 'CNY', maximumFractionDigits: 2 }).format(n);
}

function escapeHtml(s) {
	return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Strip Treemap：条带式铺排（保持横向条带，自上而下），用于满足“左上大、右下小”的顺序感
function layoutStrip(items, x, y, w, h) {
	const positive = items.filter(it => Number(it.value) > 0);
	const total = positive.reduce((s, it) => s + Number(it.value), 0);
	if (total <= 0 || w <= 0 || h <= 0) return [];
	const area = w * h;
	const nodes = positive
		.map(it => ({ ...it, _area: area * Number(it.value) / total }))
		.sort((a, b) => b._area - a._area); // 按面积降序，保证大在前

	function worst(row, containerWidth) {
		if (row.length === 0) return Infinity;
		const s = row.reduce((sum, r) => sum + r._area, 0);
		const maxA = Math.max(...row.map(r => r._area));
		const minA = Math.min(...row.map(r => r._area));
		const w2 = containerWidth * containerWidth;
		return Math.max((w2 * maxA) / (s * s), (s * s) / (w2 * minA));
	}
	function layoutRow(row, rect) {
		const s = row.reduce((sum, r) => sum + r._area, 0);
		const rowHeight = s / rect.w;
		let cx = rect.x;
		// 对齐到整数像素，避免累计误差导致重叠/露白
		const remainingHeightPx = Math.max(0, Math.round(rect.h));
		const rowHeightPx = Math.min(remainingHeightPx, Math.max(1, Math.round(rowHeight)));
		const containerRight = Math.round(rect.x + rect.w);
		for (let i = 0; i < row.length; i++) {
			const r = row[i];
			if (i < row.length - 1) {
				const idealW = r._area / rowHeight;
				const remainingWidthPx = Math.max(0, containerRight - Math.round(cx));
				const wPx = Math.min(remainingWidthPx, Math.max(1, Math.round(idealW)));
				r.x = Math.round(cx);
				r.y = Math.round(rect.y);
				r.w = wPx;
				r.h = rowHeightPx;
				cx += wPx; // 注意：我们用整数宽度推进，保证最后一个补齐
			} else {
				// 最后一个补齐至行尾，确保不超也不留缝
				r.x = Math.round(cx);
				r.y = Math.round(rect.y);
				r.w = Math.max(0, containerRight - r.x);
				r.h = rowHeightPx;
			}
		}
		rect.y = Math.round(rect.y + rowHeightPx);
		rect.h = Math.max(0, Math.round(rect.h - rowHeightPx));
	}

	const rect = { x, y, w, h };
	let row = [];
	for (const n of nodes) {
		const test = row.concat([n]);
		if (row.length === 0 || worst(test, rect.w) <= worst(row, rect.w)) {
			row = test;
		} else {
			layoutRow(row, rect);
			row = [n];
		}
	}
	if (row.length) layoutRow(row, rect);
	return nodes.map(({ _area, ...node }) => node);
}

/**
 * Squarified treemap layout implementation.
 * Input items must have a numeric field `value` and any metadata you want carried through.
 * Returns an array of positioned items with x, y, w, h assigned.
 */
function layoutSquarified(items, x, y, width, height) {
	const filteredItems = items
		.map((it) => ({ ...it, value: Math.max(0, Number(it.value) || 0) }))
		.filter((it) => it.value > 0);
	const total = filteredItems.reduce((s, it) => s + it.value, 0);
	if (total === 0 || width <= 0 || height <= 0) return [];

	// Normalize to target area for stable aspect computation
	const area = width * height;
	const scaled = filteredItems
		.sort((a, b) => b.value - a.value)
		.map((it) => ({ ...it, area: (it.value / total) * area }));

	const result = [];
	let row = [];
	let remaining = { x, y, w: width, h: height };

	const worstAspect = (rowItems, w) => {
		if (rowItems.length === 0) return Infinity;
		const rowArea = rowItems.reduce((s, it) => s + it.area, 0);
		const side = rowArea / w;
		let worst = 0;
		for (const it of rowItems) {
			const l = Math.min((w * w * it.area) / (rowArea * rowArea), (rowArea * rowArea) / (w * w * it.area));
			worst = Math.max(worst, l);
		}
		return worst;
	};

	const layoutRow = (rowItems, rect, horizontal) => {
		const rowArea = rowItems.reduce((s, it) => s + it.area, 0);
		if (horizontal) {
			const rowHeight = rowArea / rect.w;
			let cx = rect.x;
			for (const it of rowItems) {
				const w = it.area / rowHeight;
				result.push({ ...it, x: cx, y: rect.y, w, h: rowHeight });
				cx += w;
			}
			rect.y += rowHeight;
			rect.h -= rowHeight;
		} else {
			const rowWidth = rowArea / rect.h;
			let cy = rect.y;
			for (const it of rowItems) {
				const h = it.area / rowWidth;
				result.push({ ...it, x: rect.x, y: cy, w: rowWidth, h });
				cy += h;
			}
			rect.x += rowWidth;
			rect.w -= rowWidth;
		}
	};

	let horizontal = width < height ? false : true; // choose orientation by container shape
	for (const it of scaled) {
		const test = row.concat([it]);
		if (row.length === 0 || worstAspect(row, horizontal ? remaining.w : remaining.h) >= worstAspect(test, horizontal ? remaining.w : remaining.h)) {
			row = test;
		} else {
			layoutRow(row, remaining, horizontal);
			horizontal = remaining.w >= remaining.h; // re-evaluate orientation
			row = [it];
		}
	}
	if (row.length) {
		layoutRow(row, remaining, horizontal);
	}

	// Round to integers to avoid subpixel gaps/overlaps
	return result.map((n) => ({ ...n, x: Math.round(n.x), y: Math.round(n.y), w: Math.max(0, Math.round(n.w)), h: Math.max(0, Math.round(n.h)) }));
}

/**
 * Adaptive child layout: if container is too tall and narrow, split items into 2 subcolumns
 * and squarify within each subcolumn to avoid a single vertical stack.
 */
function layoutChildrenAdaptive(items, x, y, w, h) {
	const filtered = (items || []).filter((it) => (Number(it.value) || 0) > 0);
	if (filtered.length === 0 || w <= 0 || h <= 0) return [];
	const aspect = w / h;
	// Thresholds can be tuned; below 0.35 tends to create single-column stacks
	if (aspect >= 0.35 || filtered.length <= 3) {
		return layoutSquarified(filtered, x, y, w, h);
	}
	// Split into 2 groups by greedy area balancing
	const total = filtered.reduce((s, it) => s + (Number(it.value) || 0), 0);
	const sorted = [...filtered].sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
	const left = []; let leftSum = 0;
	const right = []; let rightSum = 0;
	for (const it of sorted) {
		if (leftSum <= rightSum) { left.push(it); leftSum += Number(it.value) || 0; }
		else { right.push(it); rightSum += Number(it.value) || 0; }
	}
	const leftW = Math.max(0, Math.round((leftSum / total) * w));
	const rightW = Math.max(0, w - leftW);
	const leftRects = leftW > 0 ? layoutSquarified(left, x, y, leftW, h) : [];
	const rightRects = rightW > 0 ? layoutSquarified(right, x + leftW, y, rightW, h) : [];
	return [...leftRects, ...rightRects];
}

/**
 * Force children to horizontal strip treemap (rows), to present as horizontal blocks.
 */
function layoutChildrenHorizontal(items, x, y, w, h) {
	const list = (items || []).filter((it) => (Number(it.value) || 0) > 0)
		.sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
	return layoutStrip(list, x, y, w, h);
}

/**
 * Group by type (category), squarify categories, then squarify children in each category rect.
 * Returns an array with group frames (isGroup=true) followed by member nodes.
 */
function layoutByCategorySquarified(items, x, y, width, height, groupInnerPadding = 6) {
	const valid = items.filter((it) => (Number(it.value) || 0) > 0);
	const typeToItems = new Map();
	for (const it of valid) {
		const key = it.type || '未分类';
		if (!typeToItems.has(key)) typeToItems.set(key, []);
		typeToItems.get(key).push(it);
	}
	const categories = Array.from(typeToItems.entries()).map(([type, arr]) => ({
		type,
		value: arr.reduce((s, a) => s + (Number(a.value) || 0), 0),
		children: arr,
	})).filter((c) => c.value > 0);

	const categoryRects = layoutSquarified(
		categories.map((c) => ({ ...c })),
		x,
		y,
		width,
		height
	);

	const categoryGap = 8; // fixed spacing between different categories
	const output = [];
	for (const crect of categoryRects) {
		// Inset group frame to create gaps between categories
		const frameX = Math.round(crect.x + categoryGap / 2);
		const frameY = Math.round(crect.y + categoryGap / 2);
		const frameW = Math.max(0, Math.round(crect.w - categoryGap));
		const frameH = Math.max(0, Math.round(crect.h - categoryGap));
		// Push a group frame node for visual framing and label
		output.push({
			isGroup: true,
			type: crect.type,
			value: crect.value,
			x: frameX,
			y: frameY,
			w: frameW,
			h: frameH,
		});

		// Layout children inside with inner padding
		const innerX = frameX + groupInnerPadding;
		const innerY = frameY + groupInnerPadding + 18; // reserve top strip for group label
		const innerW = Math.max(0, frameW - groupInnerPadding * 2);
		const innerH = Math.max(0, frameH - groupInnerPadding * 2 - 18);
		if (innerW <= 0 || innerH <= 0) continue;
		const childRects = layoutChildrenHorizontal(crect.children.map((ch) => ({ ...ch })), innerX, innerY, innerW, innerH);
		for (const r of childRects) {
			output.push({
				...r,
				name: r.name,
				id: r.id,
				type: crect.type,
				currency: r.currency,
				groupX: frameX,
				groupY: frameY,
				groupW: frameW,
				groupH: frameH,
			});
		}
	}
	return output;
}

/**
 * Vertically equal-split the top-level by category. Within each column, squarify children.
 */
function layoutByCategoryVerticalEqual(items, x, y, width, height, groupInnerPadding = 6) {
	const valid = items.filter((it) => (Number(it.value) || 0) > 0);
	const typeToItems = new Map();
	for (const it of valid) {
		const key = it.type || '未分类';
		if (!typeToItems.has(key)) typeToItems.set(key, []);
		typeToItems.get(key).push(it);
	}
	let categories = Array.from(typeToItems.entries()).map(([type, arr]) => ({
		type,
		value: arr.reduce((s, a) => s + (Number(a.value) || 0), 0),
		children: arr,
	}));
	if (categories.length === 0) return [];
	// Sort by value descending so大的类别靠左，但列宽相等
	categories.sort((a, b) => b.value - a.value);

	const n = categories.length;
	const categoryGap = 8; // fixed spacing between categories (columns)
	const totalGap = Math.max(0, (n - 1) * categoryGap);
	const usableWidth = Math.max(0, width - totalGap);
	const output = [];
	const labelStrip = 18;
	const extraTopPad = 20;   // 组内上额外留白，避免重叠
	const extraBottomPad = 20; // 组内下额外留白，避免重叠
	for (let i = 0; i < n; i++) {
		const x0 = Math.round(x + (i * usableWidth) / n + i * categoryGap);
		const x1 = Math.round(x + ((i + 1) * usableWidth) / n + i * categoryGap);
		const colW = Math.max(0, x1 - x0);
		const frame = { x: x0, y, w: colW, h: height };
		const cat = categories[i];
		output.push({ isGroup: true, type: cat.type, value: cat.value, x: frame.x, y: frame.y, w: frame.w, h: frame.h });

		const innerX = frame.x + groupInnerPadding;
		const innerY = frame.y + groupInnerPadding + labelStrip + extraTopPad; // label strip + 额外上内边距
		const innerW = Math.max(0, frame.w - groupInnerPadding * 2);
		const innerH = Math.max(0, frame.h - groupInnerPadding * 2 - labelStrip - extraTopPad - extraBottomPad);
		if (innerW <= 0 || innerH <= 0) continue;
		const childRects = layoutChildrenHorizontal(cat.children.map((c) => ({ ...c })), innerX, innerY, innerW, innerH);
		for (const r of childRects) {
			output.push({
				...r,
				name: r.name,
				id: r.id,
				type: cat.type,
				currency: r.currency,
				groupX: frame.x,
				groupY: frame.y,
				groupW: frame.w,
				groupH: frame.h,
			});
		}
	}
	return output;
}

function renderTreemap() {
	const container = document.getElementById('treemap');
	container.innerHTML = '';
	container.style.overflow = 'hidden'; // prevent scrollbars, clamp nodes instead
	const data = getFilteredAssets();
	const rect = container.getBoundingClientRect();
	const outerPadding = 6;
	const nodes = layoutByCategoryVerticalEqual(
		data,
		outerPadding,
		outerPadding,
		Math.max(0, rect.width - outerPadding * 2),
		Math.max(0, rect.height - outerPadding * 2),
		6
	);
	const total = data.reduce((s, a) => s + (Number(a.value) || 0), 0);
	document.getElementById('total-value').textContent = `总计：${formatCurrency(total, 'CNY')}`;

	const tileGap = 2; // 统一 2px 间隔
	const paddingPx = 6; // 与 .treemap-node 的 padding 保持一致，用于计算文字空间
	const fullLabelMinWidth = 90; // 完整两行最小宽度（经验值）
	const fullLabelMinHeight = 32; // 完整两行最小高度（经验值）
	const nameOnlyMinWidth = 56; // 仅名称一行最小宽度
	const nameOnlyMinHeight = 18; // 仅名称一行最小高度
	const maxX = Math.max(0, Math.round(rect.width));
	const maxY = Math.max(0, Math.round(rect.height));
	const groupBoundsByType = new Map();
	const groupInnerPadding = 6;
	const labelStripHeight = 18;
	const extraTopPad = 20;
	const extraBottomPad = 20;

	for (const node of nodes) {
		if (node.isGroup) {
			const group = document.createElement('div');
			group.className = 'treemap-group';
			let gx = Math.max(0, Math.round(node.x));
			let gy = Math.max(0, Math.round(node.y));
			let gw = Math.max(0, Math.round(node.w));
			let gh = Math.max(0, Math.round(node.h));
			if (gx + gw > maxX) gw = Math.max(0, maxX - gx);
			if (gy + gh > maxY) gh = Math.max(0, maxY - gy);
			group.style.left = gx + 'px';
			group.style.top = gy + 'px';
			group.style.width = gw + 'px';
			group.style.height = gh + 'px';
			group.innerHTML = '';
			group.dataset.type = node.type;
			group.title = `${node.type} · ${formatCurrency(node.value, 'CNY')}`;
			// record actual group outer and inner bounds for children clamping
			const innerL = gx + groupInnerPadding;
			const innerT = gy + groupInnerPadding + labelStripHeight + extraTopPad;
			const innerR = gx + gw - groupInnerPadding;
			const innerB = gy + gh - groupInnerPadding - extraBottomPad;
			groupBoundsByType.set(node.type, { x: gx, y: gy, w: gw, h: gh, innerL, innerT, innerR, innerB });
			container.appendChild(group);
			continue;
		}
		const div = document.createElement('div');
		div.className = 'treemap-node';
		// 为方块之间添加间隔：对每个节点做内缩
		let left = Math.round(node.x) + Math.floor(tileGap / 2);
		let top = Math.round(node.y) + Math.floor(tileGap / 2);
		let width = Math.max(0, Math.round(node.w) - tileGap);
		let height = Math.max(0, Math.round(node.h) - tileGap);
		// clamp to parent group's INNER bounds; fallback to computed inner from provided groupX/Y/W/H
		let boundLeft = 0, boundTop = 0, boundRight = maxX, boundBottom = maxY;
		const gb = groupBoundsByType.get(node.type);
		if (gb) {
			boundLeft = gb.innerL;
			boundTop = gb.innerT;
			boundRight = gb.innerR;
			boundBottom = gb.innerB;
		} else if (node.groupX != null) {
			const gx2 = Math.round(node.groupX);
			const gy2 = Math.round(node.groupY || 0);
			const gw2 = Math.round(node.groupW || 0);
			const gh2 = Math.round(node.groupH || 0);
			boundLeft = gx2 + groupInnerPadding;
			boundTop = gy2 + groupInnerPadding + labelStripHeight + extraTopPad;
			boundRight = gx2 + gw2 - groupInnerPadding;
			boundBottom = gy2 + gh2 - groupInnerPadding - extraBottomPad;
		}
		// safety inset by border width as well
		const groupBorderWidth = 1;
		boundLeft += groupBorderWidth;
		boundTop += groupBorderWidth;
		boundRight -= groupBorderWidth;
		boundBottom -= groupBorderWidth;
		// extra 1px safety to absorb rounding accumulation at the bottom edge
		boundBottom = Math.max(boundTop, boundBottom - 1);
		if (left < boundLeft) left = boundLeft;
		if (top < boundTop) top = boundTop;
		if (left + width > boundRight) width = Math.max(0, boundRight - left);
		if (top + height > boundBottom) height = Math.max(0, boundBottom - top);
		div.style.left = left + 'px';
		div.style.top = top + 'px';
		div.style.width = width + 'px';
		div.style.height = height + 'px';
		const color = colorFromString(node.id || node.name || node.type);
		div.style.background = color;
		div.dataset.id = node.id;
		// 文本显示策略：充足 -> 全部两行；中等 -> 仅名称；不足 -> 不显示
		const innerW = Math.max(0, width - paddingPx * 2);
		const innerH = Math.max(0, height - paddingPx * 2);
		if (innerW >= fullLabelMinWidth && innerH >= fullLabelMinHeight) {
			div.innerHTML = `
				<div class="name">${escapeHtml(node.name)}</div>
				<div class="value">${node.type} · ${formatCurrency(node.value, node.currency)}</div>
			`;
		} else if (innerW >= nameOnlyMinWidth && innerH >= nameOnlyMinHeight) {
			div.innerHTML = `
				<div class="name">${escapeHtml(node.name)}</div>
			`;
		} else {
			div.innerHTML = '';
		}
		div.title = `${node.name}\n${node.type} · ${formatCurrency(node.value, node.currency)}`;
		attachNodeEvents(div, node);
		container.appendChild(div);
	}
}

function attachNodeEvents(el, node) {
	const tooltip = document.getElementById('tooltip');
	el.addEventListener('mousemove', (e) => {
		tooltip.style.display = 'block';
		tooltip.style.left = e.clientX + 12 + 'px';
		tooltip.style.top = e.clientY + 12 + 'px';
		tooltip.innerHTML = `${escapeHtml(node.name)}<br/>类型：${escapeHtml(node.type)}<br/>金额：${formatCurrency(node.value, node.currency)}<br/>备注：${escapeHtml(node.remark || '')}`;
	});
	el.addEventListener('mouseleave', () => { tooltip.style.display = 'none'; });
	el.addEventListener('click', () => openModal(node));
}

// CRUD 与表单
function openModal(asset) {
	const overlay = document.getElementById('modal-overlay');
	overlay.style.display = 'flex';
	document.getElementById('modal-title').textContent = asset ? '编辑资产' : '新增资产';
	document.getElementById('asset-id').value = asset?.id || '';
	document.getElementById('asset-name').value = asset?.name || '';
	document.getElementById('asset-type').value = asset?.type || '股票';
	document.getElementById('asset-value').value = asset?.value ?? '';
	document.getElementById('asset-currency').value = asset?.currency || 'CNY';
	document.getElementById('asset-remark').value = asset?.remark || '';
}

function closeModal() {
	document.getElementById('modal-overlay').style.display = 'none';
}

function upsertAssetFromForm(e) {
	e.preventDefault();
	const id = document.getElementById('asset-id').value || cryptoRandomId();
	const asset = {
		id,
		name: document.getElementById('asset-name').value.trim(),
		type: document.getElementById('asset-type').value,
		value: Number(document.getElementById('asset-value').value || 0),
		currency: (document.getElementById('asset-currency').value || 'CNY').trim(),
		remark: document.getElementById('asset-remark').value.trim(),
	};
	const idx = state.assets.findIndex(a => a.id === id);
	if (idx >= 0) state.assets[idx] = asset; else state.assets.push(asset);
	closeModal();
	renderAll();
}

function deleteAsset(id) {
	if (!confirm('确认删除该资产吗？')) return;
	state.assets = state.assets.filter(a => a.id !== id);
	renderAll();
}

// 过滤
function applyFilters() {
	state.filters.type = document.getElementById('filter-type').value;
	state.filters.min = document.getElementById('filter-min').value;
	state.filters.max = document.getElementById('filter-max').value;
	state.filters.keyword = document.getElementById('filter-keyword').value.trim();
	renderAll();
}

function resetFilters() {
	document.getElementById('filter-type').value = '';
	document.getElementById('filter-min').value = '';
	document.getElementById('filter-max').value = '';
	document.getElementById('filter-keyword').value = '';
	applyFilters();
}

function normalizeKey(k) {
	return String(k || '').trim().toLowerCase();
}

function mapRowToAsset(row) {
	const mapped = {};
	for (const key in row) {
		const nk = normalizeKey(key);
		mapped[nk] = row[key];
	}
	const name = String(mapped['name'] ?? mapped['名称'] ?? '').trim();
	const type = String(mapped['type'] ?? mapped['类型'] ?? '').trim();
	const valueRaw = mapped['value'] ?? mapped['金额'];
	const currency = String(mapped['currency'] ?? mapped['币种'] ?? 'CNY').trim();
	const remark = String(mapped['remark'] ?? mapped['备注'] ?? '').trim();
	const value = Number(valueRaw);
	return { id: cryptoRandomId(), name, type: type || '其他', value: Number.isFinite(value) ? value : NaN, currency, remark };
}

// 导入/导出
function importFromExcel(file) {
	const reader = new FileReader();
	reader.onload = (e) => {
		const data = new Uint8Array(e.target.result);
		const workbook = XLSX.read(data, { type: 'array' });
		const sheetName = workbook.SheetNames[0];
		const ws = workbook.Sheets[sheetName];
		const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
		const parsed = [];
		let invalid = 0;
		for (const r of rows) {
			const a = mapRowToAsset(r);
			if (a.name && Number.isFinite(a.value)) parsed.push(a); else invalid++;
		}
		if (parsed.length) state.assets = parsed;
		renderAll();
		if (invalid > 0) {
			alert(`导入完成：有效 ${parsed.length} 条，忽略 ${invalid} 条（缺少名称或金额非数字）。`);
		}
	};
	reader.readAsArrayBuffer(file);
}

function importFromJSON(file) {
	const reader = new FileReader();
	reader.onload = (e) => {
		try {
			const text = String(e.target.result || '').trim();
			if (!text) return;
			const raw = JSON.parse(text);
			const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.assets) ? raw.assets : []);
			if (!Array.isArray(list) || list.length === 0) {
				alert('JSON 格式不正确：应为数组或包含 assets 数组的对象。');
				return;
			}
			let valid = 0, invalid = 0;
			const parsed = [];
			for (const r of list) {
				const a = mapRowToAsset(r || {});
				if (a.name && Number.isFinite(a.value)) { parsed.push(a); valid++; } else { invalid++; }
			}
			if (parsed.length) state.assets = parsed;
			renderAll();
			if (invalid > 0) alert(`导入完成：有效 ${valid} 条，忽略 ${invalid} 条（缺少名称或金额非数字）。`);
		} catch (err) {
			alert('JSON 解析失败，请检查文件内容。');
		}
	};
	reader.readAsText(file, 'utf-8');
}

function importFromJSONText(text) {
	try {
		const trimmed = String(text || '').trim();
		if (!trimmed) {
			alert('请输入 JSON 文本');
			return;
		}
		const raw = JSON.parse(trimmed);
		const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.assets) ? raw.assets : []);
		if (!Array.isArray(list) || list.length === 0) {
			alert('JSON 格式不正确：应为数组或包含 assets 数组的对象。');
			return;
		}
		let valid = 0, invalid = 0;
		const parsed = [];
		for (const r of list) {
			const a = mapRowToAsset(r || {});
			if (a.name && Number.isFinite(a.value)) { parsed.push(a); valid++; } else { invalid++; }
		}
		if (parsed.length) state.assets = parsed;
		renderAll();
		if (invalid > 0) alert(`导入完成：有效 ${valid} 条，忽略 ${invalid} 条（缺少名称或金额非数字）。`);
	} catch (err) {
		alert('JSON 解析失败，请检查文本内容。');
	}
}

function exportJSON() {
	const blob = new Blob([JSON.stringify(state.assets, null, 2)], { type: 'application/json' });
	downloadBlob(blob, 'assets.json');
}

function exportCSV() {
	const header = ['id','name','type','value','currency','remark'];
	const lines = [header.join(',')].concat(state.assets.map(a => header.map(k => csvEscape(a[k])).join(',')));
	const blob = new Blob(["\ufeff" + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
	downloadBlob(blob, 'assets.csv');
}

function exportXLSX() {
	const ws = XLSX.utils.json_to_sheet(state.assets);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'assets');
	XLSX.writeFile(wb, 'assets.xlsx');
}

function downloadTemplate() {
	const header = ['name','type','value','currency','remark'];
	const sample = [
		{ name: '招商中证白酒ETF', type: '基金', value: 20000, currency: 'CNY', remark: '长期持有' },
		{ name: '贵州茅台', type: '股票', value: 35000, currency: 'CNY', remark: '核心持仓' },
	];
	const ws = XLSX.utils.json_to_sheet(sample, { header });
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, 'template');
	XLSX.writeFile(wb, '资产模板.xlsx');
}

function csvEscape(val) {
	const s = String(val ?? '');
	if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
	return s;
}

function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url; a.download = filename; a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// 事件绑定
function bindEvents() {
	document.getElementById('btn-add').addEventListener('click', () => openModal());
	document.getElementById('btn-cancel').addEventListener('click', closeModal);
	document.getElementById('asset-form').addEventListener('submit', upsertAssetFromForm);
	document.getElementById('btn-filter').addEventListener('click', applyFilters);
	document.getElementById('btn-reset').addEventListener('click', resetFilters);
	document.getElementById('file-input').addEventListener('change', (e) => {
		const file = e.target.files?.[0];
		if (file) importFromExcel(file);
	});
	document.getElementById('json-input').addEventListener('change', (e) => {
		const file = e.target.files?.[0];
		if (file) importFromJSON(file);
	});
	document.getElementById('import-json-text').addEventListener('click', () => {
		const text = document.getElementById('json-textarea').value;
		importFromJSONText(text);
	});
	document.getElementById('export-json').addEventListener('click', exportJSON);
	document.getElementById('export-csv').addEventListener('click', exportCSV);
	document.getElementById('export-xlsx').addEventListener('click', exportXLSX);
	document.getElementById('download-template').addEventListener('click', downloadTemplate);
	// table actions
	document.getElementById('table-body').addEventListener('click', (e) => {
		const target = e.target.closest('button');
		if (!target) return;
		const id = target.getAttribute('data-id');
		const action = target.getAttribute('data-action');
		const asset = state.assets.find(a => a.id === id);
		if (action === 'edit' && asset) openModal(asset);
		if (action === 'delete' && asset) deleteAsset(id);
	});
	// 自适应重绘
	window.addEventListener('resize', () => { renderTreemap(); });
}

function renderAll() {
	renderTable();
	renderTreemap();
}

// 初始化，测试下
window.addEventListener('DOMContentLoaded', () => {
	bindEvents();
	renderAll();
}); 