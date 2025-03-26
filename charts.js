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
// 当前是否显示增速
let showGrowth = false;

// 初始化后获取DOM元素
document.addEventListener('DOMContentLoaded', () => {
    // 初始化图表
    initChart();
    
    // 绑定事件监听器
    const chartTypeSelector = document.getElementById('chart-type');
    chartTypeSelector.addEventListener('change', (e) => {
        currentChartType = e.target.value;
        updateChart();
    });
    
    // 视图切换按钮
    const valueViewBtn = document.getElementById('value-view');
    const growthViewBtn = document.getElementById('growth-view');
    
    valueViewBtn.addEventListener('click', () => {
        showGrowth = false;
        updateActiveView();
        updateChart();
    });
    
    growthViewBtn.addEventListener('click', () => {
        showGrowth = true;
        updateActiveView();
        updateChart();
    });
    
    // 初始渲染
    updateActiveView();
    updateChart();
});

// 更新当前激活的视图
function updateActiveView() {
    // 更新按钮状态
    document.getElementById('value-view').classList.toggle('active', !showGrowth);
    document.getElementById('growth-view').classList.toggle('active', showGrowth);
}

// 初始化图表
function initChart() {
    // 创建图表实例
    window.chart = echarts.init(document.getElementById('chart'));
}

// 更新图表显示
function updateChart() {
    renderChart();
}

// 渲染图表
function renderChart() {
    // 确定基于当前选择的数据类型和是否显示增速
    let dataKey = currentChartType;
    if (showGrowth) {
        dataKey = currentChartType + '-growth';
    }
    
    // 获取数据
    const chartData = getChartData(dataKey);
    
    // 确定标题和单位
    const {title, unit, isGrowth} = getChartInfo(dataKey);
    
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
                    
                    const countryName = param.seriesName === '中国' ? '中国' : '美国';
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
        toolbox: {
            feature: {
                dataZoom: {},
                restore: {},
                saveAsImage: {}
            },
            right: 20,
            top: 20
        },
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
                bottom: 10,
                height: 20,
                xAxisIndex: [0]
            }
        ],
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
                    shadowBlur: 5,
                    shadowOffsetY: 3
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
                    shadowBlur: 5,
                    shadowOffsetY: 3
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
    chart.setOption(option, true);
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
    if (chart) {
        chart.resize();
    }
});