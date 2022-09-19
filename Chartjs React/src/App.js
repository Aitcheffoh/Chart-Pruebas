import 'chart.js/auto';
import {Chart as ReactChart} from 'react-chartjs-2';
import {Chart} from 'chart.js'
import './App.css'
import React, {useState} from "react";

function App(){

    const dates = [];
    const numbers = [];
    const volume= [];

    for (let i = 0; i < 200; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push(date.setHours(0, 0, 0, 0));
        numbers.push(Math.random() * 10);
        volume.push(Math.random() * 100);
    }

    const[data, setData] = useState({
        labels: dates,
        datasets: [{
            label: 'Weekly Sales',
            data: numbers,
            fill: {
                target: {
                    value: numbers[0]
                },
                below: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea, data, scales} = chart;
                    if (!chartArea) {
                        return null;
                    }
                    return belowGradient(ctx, chartArea, data, scales)
                },
                above: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea, data, scales} = chart;
                    if (!chartArea) {
                        return null;
                    }
                    return aboveGradient(ctx, chartArea, data, scales)
                },
            },
            borderColor: (context) => {
                const chart = context.chart;
                const {ctx, chartArea, data, scales} = chart;
                if (!chartArea) {
                    return null;
                }
                return getGradient(ctx, chartArea, data, scales)
            },
            tension: 0,
            pointRadius: 0,
            pointHitRadius: 0,
            pointHoverRadius: 0,
            borderWidth: 2,
        }]
    })

    const dottedLine = {
        id:'dottedLine',
        beforeDatasetsDraw(chart, args, pluginsOptions) {

            const {ctx, data, chartArea:{left, right, width}, scales:{x, y}} = chart;
            const startingPoint = data.datasets[0].data[0];

            ctx.save();
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.setLineDash([1, 5]);
            ctx.strokeStyle = 'rgba(102, 120, 120, 1)'
            ctx.moveTo(left, y.getPixelForValue(startingPoint));
            ctx.lineTo(right, y.getPixelForValue(startingPoint));
            ctx.stroke();
            ctx.closePath();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.fillStyle= 'rgba(102, 102, 102, 1)'
            ctx.fillRect(0, y.getPixelForValue(startingPoint)-10, left, 20)
            ctx.closePath();

            ctx.font= '12px sans-serif';
            ctx.fillStyle='white';
            ctx.textBaseline = 'middle';
            ctx.textAlign= 'center';
            ctx.fillText(startingPoint.toFixed(2), left/2, y.getPixelForValue(startingPoint))
        }
    }

    /*const crosshairLine = {
        id: 'crosshairLine',
        afterDraw(chart, args, pluginsOptions) {
            const { canvas, ctx, chartArea:{left, right, top, bottom}} = chart;

            window.addEventListener('mousemove', (e) => {
                crosshairLine(e)
            })

            function crosshairLine(mousemove) {
                chart.update('none');
                ctx.restore();

                const coorX = mousemove.offsetX;
                const coorY = mousemove.offsetY;

                if(coorX >= left && coorX <= right && coorY >= top
                    && coorY <= bottom){
                    canvas.style.cursor = 'crosshair'
                }else{
                    canvas.style.cursor = 'default'
                }

                ctx.lineWidth = 1;
                ctx.strokeStyle = '#666';
                ctx.setLineDash([3, 3]);

                if(coorX >= left && coorX <= right && coorY >= top && coorY <= bottom) {

                    //Horizontal Line
                    ctx.beginPath();
                    ctx.moveTo(left, coorY);
                    ctx.lineTo(right, coorY);
                    ctx.stroke();
                    ctx.closePath();

                    //Vertical Line
                    ctx.beginPath();
                    ctx.moveTo(coorX, top);
                    ctx.lineTo(coorX, bottom);
                    ctx.stroke();
                    ctx.closePath();

                    crosshairLabel(chart, mousemove);
                    crosshairPoint(chart, mousemove);
                }
                ctx.restore();
                ctx.setLineDash([]);
            }

            function crosshairLabel(mousemove) {
                const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;

                const coorX = mousemove.offsetX;
                const coorY = mousemove.offsetY;
                const textWidth = ctx.measureText(new Date(x.getValueForPixel(coorX)).toLocaleString()).width + 10;


                ctx.font= '12px sans-serif';
                ctx.textBaseline= 'middle';
                ctx.textAlign= 'center';

                //yLabel
                ctx.beginPath();
                ctx.fillStyle = 'rgba( 132, 132, 132, 1)';
                ctx.fillRect(0, coorY -10, left, 20);
                ctx.closePath();

                ctx.fillStyle= 'white';
                ctx.fillText(y.getValueForPixel(coorY).toFixed(2), left/2, coorY);


                //xLabel
                ctx.beginPath();
                ctx.fillStyle = 'rgba( 132, 132, 132, 1)';
                ctx.fillRect( coorX - (textWidth /2), bottom, textWidth, 20);
                ctx.closePath();

                ctx.fillStyle= 'white';
                ctx.fillText(new Date(x.getValueForPixel(coorX)).toLocaleString(), coorX, bottom + 10);
            }

            function crosshairPoint(mousemove) {

                const {ctx, data, chartArea: {top, bottom, left, right, width, height}, scales: {x, y}} = chart;

                const coorX = mousemove.offsetX;
                const coorY = mousemove.offsetY;

                ctx.beginPath();
                ctx.strokeStyle ='#FFF';
                ctx.lineWidth =3;
                ctx.setLineDash([]);


                const angle = Math.PI / 180;

                const leftoffset = x.getPixelForValue(x.min) - left;
                const rightoffset = right - x.getPixelForValue(x.max);

                const width2 = width - (leftoffset + rightoffset);

                const segments = width2 / (dates.indexOf(x.max) - dates.indexOf(x.min));

                const yOpening = y.getPixelForValue(data.datasets[0].data[0]);
                let index = Math.floor((coorX - (left + leftoffset)) / segments) + dates.indexOf(x.min);


                let yStart = y.getPixelForValue(data.datasets[0].data[index]);
                let yEnd = y.getPixelForValue(data.datasets[0].data[index + 1]);

                let yInterpolation = yStart + ((yEnd - yStart) / segments *
                    (coorX - x.getPixelForValue(data.labels[index]) ));

                if(yOpening >= yInterpolation){
                    ctx.fillStyle = 'rgba(75, 192, 192, 1)';
                } else {
                    ctx.fillStyle = 'rgba(255, 26, 104, 1)';
                }

                //draw the circle
                ctx.arc(
                    coorX,
                    yInterpolation, //change later
                    5,
                    0,
                    angle * 360,
                    false,
                );
                ctx.fill();
                ctx.stroke();
            }
        }
    }*/

    Chart.register(dottedLine, );

    const [config, setConfig] = useState({
        type: 'line',
        data,
        options: {
            layout: {
                padding: {
                    left: 10,
                    right: 5
                }
            },
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    min:dates[0],
                    max:dates[dates.length - 1],
                    grid: {
                        drawOnChartArea : false,
                        drawTicks : true,
                        drawBorder : false,
                        offset: false
                    },
                    ticks: {
                        callback: ((value, index, values) =>{
                            const totalTicks = values.length - 2;
                            const monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'
                                ,'Nov','Dec']
                            const currentTicks = new Date(values[index].value);

                            if (currentTicks.getDate() === 1){
                                return monthArray[currentTicks.getMonth()];
                            }
                            if (currentTicks.getDate() === 10 || currentTicks.getDate() === 20){
                                return currentTicks.getDate();
                            }
                            if (totalTicks < 40){
                                return currentTicks.getDate();
                            }
                        }),
                        font:{
                            weight:(values) => {
                                if(values.tick.label.length === 3){
                                    return 'bold'}
                            }
                        }
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    enabled: false,
                }
            }
        },
        plugins:[dottedLine]
    })

    function getGradient( ctx, chartArea, data, scales ){

        const {left,right,top,bottom,width,height} = chartArea;
        const {x,y} = scales;
        const gradientBorder = ctx.createLinearGradient(0,0,0,bottom);
        let shift = y.getPixelForValue(data.datasets[0].data[0]) /bottom;

        if (shift > 1){
            shift = 1;
        }

        if (shift < 0){
            shift = 0;
        }

        gradientBorder.addColorStop(0, 'rgba(75, 192, 192, 1)');
        gradientBorder.addColorStop(shift, 'rgba(75, 192, 192, 1)');
        gradientBorder.addColorStop(shift, 'rgba(255, 26, 104, 1)');
        gradientBorder.addColorStop(1, 'rgba(255, 26, 104, 1)');
        return gradientBorder
    }

    function belowGradient( ctx, chartArea, data, scales ){
        const {left,right,top,bottom,width,height} = chartArea;
        const {x,y} = scales;
        const gradientBackground = ctx.createLinearGradient(0,y.getPixelForValue(data.datasets[0].data[0]),
            0, bottom);
        gradientBackground.addColorStop(0, 'rgba(255, 26, 104, 0)')
        gradientBackground.addColorStop(1, 'rgba(255, 26, 104, 0.5)')
        return gradientBackground;
    }

    function aboveGradient( ctx, chartArea, data, scales ){
        const {left,right,top,bottom,width,height} = chartArea;
        const {x,y} = scales;
        const gradientBackground = ctx.createLinearGradient(0,y.getPixelForValue(data.datasets[0].data[0]),
            0, top);
        gradientBackground.addColorStop(0, 'rgba(75, 192, 192, 0)')
        gradientBackground.addColorStop(1, 'rgba(75, 192, 192, 0.5)')
        return gradientBackground;
    }

    return (
        <div className="contenedorChart">
            <ReactChart type='line' data={data} options={config} />
        </div>
    )
}

export default App
