import Enumerable from '../lib/linq.js-4.0.0/linq.js'

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, the amount of entries should be counted
    //for each year, the amount of individual participants should be counted
    const data = [];
    d3.csv('./data/alleTeilnehmer_shortTest.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        const dataOfParticipations = Enumerable.from(data)
            .select(function (t) {
                return {year: t.year, name: t.name};
            })
            .groupBy(
                function (t) {
                    return t.year;
                },
                function (t) {
                    return {name: t.name};
                },
                function (key, grouping) {
                    return {year: key, participations: grouping.count()};
                }
            )
            .toArray();

        console.log(dataOfParticipations);

        //get data for participants
        const dataOfParticipants = Enumerable.from(data)
            .select(function (t) {
                return {year: t.year, name: t.name};
            })
            .distinct(function (t) {return t.year + t.name})
            .groupBy(
                function (t) {
                    return t.year;
                },
                function (t) {
                    return {name: t.name};
                },
                function (key, grouping) {
                    return {year: key, participants: grouping.count()};
                }
            )
            .toArray();

        console.log(dataOfParticipants);


        //construct graph

        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 650 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        //append the svg object to the html body
        const svg = d3.select('#algTeilnehmerzahl')
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //init label
        const xAxisLabel = 'Jahr';
        const yAxisLabel = 'Teilnehmer';

        //set pixel range/scale
        let xScale = d3.scaleTime().range([0, innerWidth]);
        let yScale = d3.scaleLinear().range([innerHeight, 0]);

        const g = svg.append('g')
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        //create x, y-Axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickSize(-innerHeight)
            .tickFormat(d3.format("d"))
            .tickPadding(15);

        const yAxis = d3.axisLeft(yScale)
            .tickSize(-innerWidth)
            .tickPadding(10)
            .tickFormat(d3.format('d'))

        function update(d){
            //set data range
            xScale.domain([2008, 2020]);
            yScale.domain([0, 100000]);

            //set x, y-Axis
            const yAxisG = g.append('g').call(yAxis);
            yAxisG.selectAll('.domain').remove();
            yAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', -45)
                .attr('x', -innerHeight / 2)
                .attr('fill', 'black')
                .attr('transform', `rotate(-90)`)
                .attr('text-anchor', 'middle')
                .text(yAxisLabel);

            const xAxisG = g.append('g').call(xAxis)
                .attr('transform', `translate(0,${innerHeight})`);
            xAxisG.select('.domain').remove();
            xAxisG.append('text')
                .attr('class', 'axis-label')
                .attr('y', 40)
                .attr('x', innerWidth / 2)
                .attr('fill', 'black')
                .text(xAxisLabel);

            //bind data to graph
            //create line of participations
            svg.append("path")
                .datum(d)
                .attr("fill", "none")
                .attr("stroke", "#004085")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) {
                        return xScale(d.year)
                    })
                    .y(function (d) {
                        return yScale(d.participations)
                    })
                )
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

            //create dots of participations
            svg.selectAll("dot")
                .data(d)
                .enter()
                .append("circle")
                .attr("fill", "#004085")
                .attr("cx", function (d) {
                    return xScale(d.year)
                })
                .attr("cy", function (d) {
                    return yScale(d.participations)
                })
                .attr("r", 4)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

            //TODO: remove second line as soon as update() call works
            //TODO: update axis range together with data
            //TODO: change color per dataset

            // create line of participants
            svg.append("path")
                .datum(dataOfParticipants)
                .attr("fill", "none")
                .attr("stroke", "#850014")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) {
                        return xScale(d.year)
                    })
                    .y(function (d) {
                        return yScale(d.participants)
                    })
                )
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

            //create dots of participants
            svg.selectAll("dot")
                .data(dataOfParticipants)
                .enter()
                .append("circle")
                .attr("fill", "#850014")
                .attr("cx", function (d) {
                    return xScale(d.year)
                })
                .attr("cy", function (d) {
                    return yScale(d.participants)
                })
                .attr("r", 4)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
        }

        update(dataOfParticipations);
    });
});