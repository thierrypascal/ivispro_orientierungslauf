import Enumerable from '../lib/linq.js-4.0.0/linq.js'

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, each participant should have a line showing the amount of participations per year
    const data = [];
    d3.csv('./data/alleTeilnehmer_shortTest.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        //Welche Datenstruktur wird benötigt?
        //[name: name, ppY: [{year: 2008, p: y}, {year: 2009, p: y}, ...]], ...]
        const slimData = (Enumerable.from(data)
            .select(function (t) {
                return {name: t.name, year: t.year, dob: t.dob};
            })
            .toArray());

        const dataOfParticipants = (Enumerable.from(slimData)
            .distinct(function (t) {
                return t.name
            })
            .select(function (t) {
                return {
                    name: t.name, dob: t.dob, ppY: Enumerable.from(slimData)
                        .where(n => n.name === t.name)
                        .groupBy(
                            function (t) {
                                return t.year;
                            },
                            function (t) {
                                return {name: t.name};
                            },
                            function (key, grouping) {
                                return {year: key, p: grouping.count()};
                            }).toArray()
                }
            }).orderBy(function (t) {
                return parseInt(t.dob.toString(), 10);
            })
            .toArray());

        console.log(dataOfParticipants);

        //construct graph
        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 650 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        //append the svg object to the html body
        const svg = d3.select('#teilnahmenProPersonLinie')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //init label
        const xAxisLabel = 'Jahr';
        const yAxisLabelLeft = 'Teilnehmer:in, Jahrgang abnehmend';
        const yAxisLabelRight = 'Anzahl Teilnahmen';

        //set pixel range/scale
        let xScale = d3.scaleTime().range([0, innerWidth]);
        let yScaleRight = d3.scaleLinear().range([innerHeight, 0]);
        let yScaleLeft = d3.scaleLinear().range([innerHeight, 0]);

        const g = svg.append('g')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //create x, y-Axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickSize(-innerHeight)
            .tickFormat(d3.format("d"))
            .tickPadding(15);

        const yAxisRight = d3.axisRight(yScaleRight)
            .tickSize(-innerWidth)
            .tickPadding(10)
            .tickFormat(d3.format('d'))

        const yAxisLeft = d3.axisRight(yScaleLeft)
            .tickSize(-innerWidth)
            .tickPadding(10)
            .tickFormat(d3.format('d'))

        //set data range
        xScale.domain([2008, 2020]);
        yScaleRight.domain([0, 100]);
        yScaleLeft.domain(dataOfParticipants.map(d => d.name));

        //set x, y-Axis
        const yAxisGRight = g.append('g').call(yAxisRight).attr('transform', `translate(${width - 70}, 0)`);
        //add label
        yAxisGRight.selectAll('.domain').remove();
        yAxisGRight.append('text')
            .attr('class', 'axis-label')
            .attr('y', 45)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabelRight);

        const yAxisGLeft = g.append('g').call(yAxisLeft);
        //add label
        yAxisGLeft.selectAll('.domain').remove();
        yAxisGLeft.append('text')
            .attr('class', 'axis-label')
            .attr('y', -45)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabelLeft);

        const xAxisG = g.append('g').call(xAxis)
            .attr('transform', `translate(0,${innerHeight})`);
        //add label
        xAxisG.select('.domain').remove();
        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 40)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);

        //bind data to graph
        //create line of participations
        //TODO: konzept überdenken, pro person eine linie/eine scatter group, wie werden diese über die Höhe unterschieden?
        dataOfParticipants.forEach(function (d) {
            svg.append("circle")
                .attr("cx", xScale(d.ppY[0].year))
                .attr("cy", yScaleRight(d.ppY[0].p))
                .attr("r", 5)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
        });
    });
});