// 图表配置和渲染

// 颜色配置
const colors = {
    china: '#e74c3c', // 中国 - 红色
    usa: '#3498db',   // 美国 - 蓝色
    background: 'rgba(255, 255, 255, 0.8)',
    grid: '#f5f5f5'
};

// 当前选择的图表类型
let currentChartType = 'nominal';
// 当前视图类型 (静态/交互式)
let currentView = 'static';

// 初始化后获取DOM元素
document.addEventListener('DOMContentLoaded', () => {
    // 初始化图表
    initCharts();
    
    // 绑定事件监听器
    const chartTypeSelector = document.getElementById('chart-type');
    chartTypeSelector.addEventListener('change', (e) => {
        currentChartType = e.target.value;
        updateCharts();
    });
    
    // 视图切换按钮
    const staticViewBtn = document.getElementById('static-view');
    const interactiveViewBtn = document.getElementById('interactive-view');
    
    staticViewBtn.addEventListener('click', () => {
        currentView = 'static';
        updateActiveView();
        updateCharts();
    });
    
    interactiveViewBtn.addEventListener('click', () => {
        currentView = 'interactive';
        updateActiveView();
        updateCharts();
    });
});

// 更新当前激活的视图
function updateActiveView() {
    // 更新按钮状态
    document.getElementById('static-view').classList.toggle('active', currentView === 'static');
    document.getElementById('interactive-view').classList.toggle('active', currentView === 'interactive');
    
    // 更新容器显示
    document.getElementById('static-chart-container').classList.toggle('active', currentView === 'static');
    document.getElementById('interactive-chart-container').classList.toggle('active', currentView === 'interactive');
}

// 初始化图表
function initCharts() {
    // 创建静态图表实例
    staticChart = echarts.init(document.getElementById('chart'));
    // 创建交互式图表实例
    interactiveChart = echarts.init(document.getElementById('interactive-chart'));
    
    // 初始渲染
    updateCharts();
}

// 更新图表显示
function updateCharts() {
    if (currentView === 'static') {
        renderStaticChart();
    } else {
        renderInteractiveChart();
    }
}

// 渲染静态图表
function renderStaticChart() {
    // 从当前选择获取数据
    const chartData = getChartData(currentChartType);
    
    // 确定标题和单位
    const {title, unit, isGrowth} = getChartInfo(currentChartType);
    
    // 配置选项
    const option = {
        title: {
            text: title,
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const year = params[0].axisValue;
                let result = year + '年<br/>';
                
                params.forEach(param => {
                    const value = param.value !== null && param.value !== undefined ? param.value : '无数据';
                    const formattedValue = isGrowth ? formatPercent(value) : formatNumber(value);
                    
                    const countryName = param.seriesName === 'china' ? '中国' : '美国';
                    result += countryName + ': ' + formattedValue + '<br/>';
                });
                
                return result;
            },
            backgroundColor: colors.background,
            borderColor: '#ccc',
            borderWidth: 1
        },
        legend: {
            data: ['中国', '美国'],
            bottom: 10
        },
        grid: {
            left: '5%',
            right: '5%',
            top: 60,
            bottom: 60,
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: gdpData.years,
            axisLine: {
                lineStyle: {
                    color: '#999'
                }
            },
            axisLabel: {
                formatter: '{value}年'
            }
        },
        yAxis: {
            type: 'value',
            name: unit,
            nameTextStyle: {
                padding: [0, 30, 0, 0]
            },
            axisLine: {
                lineStyle: {
                    color: '#999'
                }
            },
            splitLine: {
                lineStyle: {
                    color: colors.grid
                }
            },
            axisLabel: {
                formatter: function(value) {
                    if (isGrowth) {
                        return value + '%';
                    } else if (value >= 1000) {
                        return (value / 1000).toFixed(0) + '万亿';
                    } else {
                        return value;
                    }
                }
            }
        },
        series: [
            {
                name: '中国',
                type: 'line',
                data: chartData.china,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: colors.china
                },
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 10,
                    shadowOffsetY: 5
                },
                emphasis: {
                    itemStyle: {
                        borderColor: colors.china,
                        borderWidth: 3
                    }
                },
                markPoint: isGrowth ? {} : {
                    data: [
                        { type: 'max', name: '最大值' }
                    ],
                    symbol: 'pin',
                    symbolSize: 50,
                    itemStyle: {
                        color: colors.china
                    }
                }
            },
            {
                name: '美国',
                type: 'line',
                data: chartData.usa,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: colors.usa
                },
                lineStyle: {
                    width: 3,
                    shadowColor: 'rgba(0, 0, 0, 0.3)',
                    shadowBlur: 10,
                    shadowOffsetY: 5
                },
                emphasis: {
                    itemStyle: {
                        borderColor: colors.usa,
                        borderWidth: 3
                    }
                },
                markPoint: isGrowth ? {} : {
                    data: [
                        { type: 'max', name: '最大值' }
                    ],
                    symbol: 'pin',
                    symbolSize: 50,
                    itemStyle: {
                        color: colors.usa
                    }
                }
            }
        ]
    };
    
    // 渲染图表
    staticChart.setOption(option, true);
}

// 渲染交互式图表
function renderInteractiveChart() {
    // 获取不同指标的数据
    const nominalData = getChartData('nominal');
    const realData = getChartData('real');
    const pppData = getChartData('ppp');
    const nominalGrowthData = getChartData('nominal-growth');
    const realGrowthData = getChartData('real-growth');
    const pppGrowthData = getChartData('ppp-growth');
    
    // 图表信息
    const nominalInfo = getChartInfo('nominal');
    const realInfo = getChartInfo('real');
    const pppInfo = getChartInfo('ppp');
    const nominalGrowthInfo = getChartInfo('nominal-growth');
    const realGrowthInfo = getChartInfo('real-growth');
    const pppGrowthInfo = getChartInfo('ppp-growth');
    
    // 交互式图表配置
    const option = {
        backgroundColor: '#fff',
        title: {
            text: '中美GDP全面对比(1978-至今)',
            left: 'center',
            top: 10,
            textStyle: {
                fontSize: 20,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                const year = params[0].axisValue;
                let result = year + '年<br/>';
                
                params.forEach(param => {
                    const countryName = param.seriesName.includes('中国') ? '中国' : '美国';
                    const seriesType = param.seriesName.replace('中国', '').replace('美国', '').trim();
                    const isGrowth = seriesType.includes('增速');
                    const value = param.value !== null && param.value !== undefined ? param.value : '无数据';
                    const formattedValue = isGrowth ? formatPercent(value) : formatNumber(value);
                    
                    result += countryName + ' - ' + seriesType + ': ' + formattedValue + '<br/>';
                });
                
                return result;
            },
            backgroundColor: colors.background,
            borderColor: '#ccc',
            borderWidth: 1
        },
        legend: {
            type: 'scroll',
            bottom: 10,
            data: [
                '中国 名义GDP', '美国 名义GDP', 
                '中国 实际GDP', '美国 实际GDP', 
                '中国 GDP(PPP)', '美国 GDP(PPP)',
                '中国 名义增速', '美国 名义增速',
                '中国 实际增速', '美国 实际增速',
                '中国 PPP增速', '美国 PPP增速'
            ],
            selected: {
                '中国 名义GDP': true,
                '美国 名义GDP': true,
                '中国 实际GDP': false,
                '美国 实际GDP': false,
                '中国 GDP(PPP)': false,
                '美国 GDP(PPP)': false,
                '中国 名义增速': false,
                '美国 名义增速': false,
                '中国 实际增速': false,
                '美国 实际增速': false,
                '中国 PPP增速': false,
                '美国 PPP增速': false
            }
        },
        grid: [
            { left: '7%', right: '7%', top: 80, height: '35%', containLabel: true }
        ],
        xAxis: [
            {
                type: 'category',
                data: gdpData.years,
                gridIndex: 0,
                axisLine: { lineStyle: { color: '#999' } },
                axisLabel: { formatter: '{value}年' }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'GDP值',
                gridIndex: 0,
                axisLine: { lineStyle: { color: '#999' } },
                splitLine: { lineStyle: { color: colors.grid } },
                axisLabel: {
                    formatter: function(value) {
                        if (value >= 1000) {
                            return (value / 1000).toFixed(0) + '万亿';
                        } else {
                            return value;
                        }
                    }
                }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100,
                xAxisIndex: [0]
            },
            {
                type: 'slider',
                start: 0,
                end: 100,
                bottom: 60,
                xAxisIndex: [0]
            }
        ],
        toolbox: {
            feature: {
                dataZoom: {},
                restore: {},
                saveAsImage: {}
            },
            right: 20,
            top: 20
        },
        series: [
            // 名义GDP
            {
                name: '中国 名义GDP',
                type: 'line',
                data: nominalData.china,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.china },
                lineStyle: { width: 3 }
            },
            {
                name: '美国 名义GDP',
                type: 'line',
                data: nominalData.usa,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 3 }
            },
            // 实际GDP
            {
                name: '中国 实际GDP',
                type: 'line',
                data: realData.china,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.china },
                lineStyle: { width: 3, type: 'dashed' }
            },
            {
                name: '美国 实际GDP',
                type: 'line',
                data: realData.usa,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 3, type: 'dashed' }
            },
            // GDP (PPP)
            {
                name: '中国 GDP(PPP)',
                type: 'line',
                data: pppData.china,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.china },
                lineStyle: { width: 3, type: 'dotted' }
            },
            {
                name: '美国 GDP(PPP)',
                type: 'line',
                data: pppData.usa,
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 3, type: 'dotted' }
            },
            // 名义GDP增速
            {
                name: '中国 名义增速',
                type: 'line',
                data: nominalGrowthData.china,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.china },
                lineStyle: { width: 2 }
            },
            {
                name: '美国 名义增速',
                type: 'line',
                data: nominalGrowthData.usa,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 2 }
            },
            // 实际GDP增速
            {
                name: '中国 实际增速',
                type: 'line',
                data: realGrowthData.china,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.china },
                lineStyle: { width: 2, type: 'dashed' }
            },
            {
                name: '美国 实际增速',
                type: 'line',
                data: realGrowthData.usa,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 2, type: 'dashed' }
            },
            // GDP (PPP) 增速
            {
                name: '中国 PPP增速',
                type: 'line',
                data: pppGrowthData.china,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.china },
                lineStyle: { width: 2, type: 'dotted' }
            },
            {
                name: '美国 PPP增速',
                type: 'line',
                data: pppGrowthData.usa,
                symbol: 'circle',
                symbolSize: 6,
                yAxisIndex: 0,
                itemStyle: { color: colors.usa },
                lineStyle: { width: 2, type: 'dotted' }
            }
        ]
    };
    
    // 渲染交互式图表
    interactiveChart.setOption(option, true);
    
    // 添加快速切换按钮
    if (!document.querySelector('.interactive-controls')) {
        const container = document.getElementById('interactive-chart-container');
        const controls = document.createElement('div');
        controls.className = 'interactive-controls';
        
        const buttons = [
            { id: 'btn-nominal', text: '名义GDP' },
            { id: 'btn-real', text: '实际GDP' },
            { id: 'btn-ppp', text: 'GDP(PPP)' },
            { id: 'btn-growth', text: '增速对比' },
            { id: 'btn-all', text: '全部指标' }
        ];
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.id = button.id;
            btn.textContent = button.text;
            btn.addEventListener('click', () => {
                toggleInteractiveView(button.id);
            });
            controls.appendChild(btn);
        });
        
        container.insertBefore(controls, document.getElementById('interactive-chart'));
        
        // 默认选中第一个按钮
        document.getElementById('btn-nominal').classList.add('active');
    }
}

// 切换交互式视图
function toggleInteractiveView(viewId) {
    const allButtons = document.querySelectorAll('.interactive-controls button');
    allButtons.forEach(btn => btn.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    // 默认所有显示为false
    const legendStatus = {
        '中国 名义GDP': false, '美国 名义GDP': false,
        '中国 实际GDP': false, '美国 实际GDP': false,
        '中国 GDP(PPP)': false, '美国 GDP(PPP)': false,
        '中国 名义增速': false, '美国 名义增速': false,
        '中国 实际增速': false, '美国 实际增速': false,
        '中国 PPP增速': false, '美国 PPP增速': false
    };
    
    // 根据选择修改显示状态
    switch (viewId) {
        case 'btn-nominal':
            legendStatus['中国 名义GDP'] = true;
            legendStatus['美国 名义GDP'] = true;
            break;
        case 'btn-real':
            legendStatus['中国 实际GDP'] = true;
            legendStatus['美国 实际GDP'] = true;
            break;
        case 'btn-ppp':
            legendStatus['中国 GDP(PPP)'] = true;
            legendStatus['美国 GDP(PPP)'] = true;
            break;
        case 'btn-growth':
            legendStatus['中国 名义增速'] = true;
            legendStatus['美国 名义增速'] = true;
            legendStatus['中国 实际增速'] = true;
            legendStatus['美国 实际增速'] = true;
            legendStatus['中国 PPP增速'] = true;
            legendStatus['美国 PPP增速'] = true;
            break;
        case 'btn-all':
            Object.keys(legendStatus).forEach(key => {
                legendStatus[key] = true;
            });
            break;
    }
    
    // 更新图表的显示状态
    interactiveChart.setOption({
        legend: {
            selected: legendStatus
        }
    });
}

// 从当前选择获取数据
function getChartData(chartType) {
    switch (chartType) {
        case 'nominal':
            return gdpData.nominal;
        case 'real':
            return gdpData.real;
        case 'ppp':
            return gdpData.ppp;
        case 'nominal-growth':
            return gdpData.nominalGrowth;
        case 'real-growth':
            return gdpData.realGrowth;
        case 'ppp-growth':
            return gdpData.pppGrowth;
        default:
            return gdpData.nominal;
    }
}

// 获取图表信息
function getChartInfo(chartType) {
    switch (chartType) {
        case 'nominal':
            return {
                title: '中美名义GDP对比(1978-至今)',
                unit: '十亿美元',
                isGrowth: false
            };
        case 'real':
            return {
                title: '中美实际GDP对比(1978-至今)',
                unit: '十亿美元(2015年不变价)',
                isGrowth: false
            };
        case 'ppp':
            return {
                title: '中美GDP(PPP)对比(1978-至今)',
                unit: '十亿国际元',
                isGrowth: false
            };
        case 'nominal-growth':
            return {
                title: '中美名义GDP增速对比(1978-至今)',
                unit: '增长率(%)',
                isGrowth: true
            };
        case 'real-growth':
            return {
                title: '中美实际GDP增速对比(1978-至今)',
                unit: '增长率(%)',
                isGrowth: true
            };
        case 'ppp-growth':
            return {
                title: '中美GDP(PPP)增速对比(1978-至今)',
                unit: '增长率(%)',
                isGrowth: true
            };
        default:
            return {
                title: '中美GDP对比',
                unit: '',
                isGrowth: false
            };
    }
}

// 窗口大小变化时调整图表大小
window.addEventListener('resize', () => {
    if (staticChart) {
        staticChart.resize();
    }
    if (interactiveChart) {
        interactiveChart.resize();
    }
});