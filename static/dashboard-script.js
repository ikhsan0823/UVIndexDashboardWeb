try {
            var rawData = document.getElementById("mydiv").dataset.groupedData;
            console.log("Raw Data:", rawData);
            var groupedData = JSON.parse(rawData);
            console.log("Parsed Data:", groupedData);
            Object.keys(groupedData).forEach(function (date) {
                console.log("Data for date:", date, groupedData[date]);
                if (Array.isArray(groupedData[date]) && groupedData[date].length > 0) {
                    if (groupedData[date].every(function (data) {
                        return typeof data.uvi === 'number';
                    })) {
                        var ctx = document.getElementById('chart-' + date).getContext('2d');
                        var chart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: groupedData[date].map(function (data) {
                                    return data.hour;
                                }),
                                datasets: [{
                                    label: 'UV Index',
                                    fill: false,
                                    lineTension: 0,
                                    backgroundColor: "rgba(89, 149, 253, 1.0)",
                                    borderColor: "rgba(89, 149, 253, 0.1)",
                                    data: groupedData[date].map(function (data) {
                                        return data.uvi;
                                    }),
                                }]
                            },
                            options: {
                                legend: {display: false},
                                scales: {
                                    yAxes: [{ticks: {min: 0, max: 14}}],
                                }
                            }
                        });
                        console.log("Chart created for date:", date);
                    } else {
                        console.error("Invalid data (missing uvi property) for date:", date, groupedData[date]);
                    }
                } else {
                    console.error("Data for date is not an array:", date, groupedData[date]);
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }



document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired');

    const buttons = document.querySelectorAll('.uv-index-card .btn');
    const charts = document.querySelectorAll('.more-content canvas');
    const dates = document.querySelectorAll('.more-content h3');

    buttons.forEach(button => {
        button.addEventListener('click', function () {
            console.log('Button clicked:', this);

            const date = this.getAttribute('data-date');
            console.log('Selected date:', date);

            dates.forEach(h3 => {
                const h3Date = h3.getAttribute('data-date');
                console.log('Tanggal date:', h3Date);

                h3.style.display = h3Date === date ? 'inline' : 'none';
                console.log('h3 display:', h3.style.display);

            })
            charts.forEach(chart => {
                const chartDate = chart.getAttribute('data-date');
                console.log('Chart date:', chartDate);
                
                chart.style.display = chartDate === date ? 'inline' : 'none';
                console.log('Chart display:', chart.style.display);

                if (chartDate === date) {
                    chart.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    });
});

