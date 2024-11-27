// @ts-nocheck
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;

class ChartManager {
    chart = undefined;

    constructor(elemId) {
        let data = {
            labels: [],
            datasets: [{
                fill: 1,
                label: '',
                // borderColor: green_color,
                // backgroundColor: 'rgba(227,65,93,0.1)',
                segment: {
                    borderColor: ctx => (ctx.p1.raw < 0)?red_color:green_color,
                    backgroundColor: ctx => (ctx.p1.raw < 0)?'rgba(227,65,93,0.15)':'rgba(81,156,88,0.15)',
                    // borderDash: ctx => skipped(ctx, [6, 6]),
                },
                borderWidth: 2,
                // spanGaps: true,
                data: []
            // }, {
            //     label: '',
            //     borderColor: 'rgba(255,255,255,0.3)',
            //     borderWidth: 1,
            //     borderDash: [5, 5],
            //     data: []
            }]
        };

        let config = {
            type: 'line',
            data: data,
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                        maxHeight: 0
                    },
                    filler: {
                        propagate: true
                    },
                    autocolors: false,
                    annotation: {
                        annotations: {
                            line_day: {
                                // Indicates the type of annotation
                                type: 'line',
                                xMin: 10,
                                xMax: 10,
                                // backgroundColor: 'rgba(255, 0, 0, 0.05)',
                                borderColor: 'rgba(127, 127, 127, 00.5)',
                                borderDash: [2, 2],
                                borderWidth: 1
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            display: false
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    point:{
                        radius: 0
                    }
                },
            }
        };

        this.chart = new Chart.Chart(
            document.getElementById(elemId),
            config
        );
    }

    update(data) {
        if(!this.chart)
            return

        let dataset = {
                fill: 'origin',
                label: '',
                backgroundColor: [],
                borderColor: [],
                data: [],
        }

        // JSON.parse(JSON.stringify(dataset));
        // this.chart.data.datasets = [];
        if (this.chart.data.labels.length != data.length) {
            this.chart.data.labels = [...Array(data.length).keys()]
        }

        // while(this.chart.data.datasets[1].data.length < data.length) {
        //     this.chart.data.datasets[1].data.push(0);
        // }

        // if(this.chart.data.datasets[1].data[0].profit != data[0].profit) {
        //     for(let i = 0; i < this.chart.data.datasets[1].data.length; i++)
        //         this.chart.data.datasets[1].data[i] = data[0].profit;
        // }

        if(data[0] < data[data.length - 1]) {
            this.chart.data.datasets[0].borderColor = green_color;
            this.chart.data.datasets[0].backgroundColor = 'rgba(81,156,88,0.1)';
        } else {
            this.chart.data.datasets[0].borderColor = red_color;
            this.chart.data.datasets[0].backgroundColor = 'rgba(227,65,93,0.1)';
        }

        // let x = Math.floor(Math.random() * data.length);

        this.chart.data.datasets[0].data = [];
        let currDay = undefined;
        let dayIndex = 0;
        data.forEach((d, i) => {
            this.chart.data.datasets[0].data.push(d.profit);

            let day = new Date(d.date).getDate();
            if(currDay != day) {
                currDay = day;
                dayIndex = i;
            }
        });

        this.chart.options.plugins.annotation.annotations.line_day.xMin = dayIndex;
        this.chart.options.plugins.annotation.annotations.line_day.xMax = dayIndex;


        this.chart.update();
    }
}