import Enumerable from '../lib/linq.js-4.0.0/linq.js'

let uParticipants = document.getElementById("updateParticipants");
let uParticipations = document.getElementById("updateParticipations");

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, the amount of entries should be counted
    //for each year, the amount of individual participants should be counted
    const data = [];
    d3.csv('./data/alleTeilnehmer.csv').then((t) => {
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
                    return {year: key, p: grouping.count()};
                }
            )
            .toArray();


        //get data for participants
        const dataOfParticipants = Enumerable.from(data)
            .select(function (t) {
                return {year: t.year, name: t.name};
            })
            .distinct(function (t) {
                return t.year + t.name
            })
            .groupBy(
                function (t) {
                    return t.year;
                },
                function (t) {
                    return {name: t.name};
                },
                function (key, grouping) {
                    return {year: key, p: grouping.count()};
                }
            )
            .toArray();


        //construct graph

        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 650 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        function update(d, yTitle) {
            //clear svg bevor redrawing
            d3.selectAll("#algTeilnehmerzahl > *").remove();

            //append the svg object to the html body
            const svg = d3.select('#algTeilnehmerzahl')
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + 20)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //init label
            const xAxisLabel = 'Jahr';
            const yAxisLabel = yTitle;

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

            //set data range
            xScale.domain([2008, 2020]);
            yScale.domain(d3.extent(d, t => t.p)).nice();

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
            var u = svg.append("path").datum(d);

            u.merge(u)
                .transition()
                .duration(1000)
                .attr("fill", "none")
                .attr("stroke", "#004085")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .x(function (d) {
                        return xScale(d.year)
                    })
                    .y(function (d) {
                        return yScale(d.p)
                    })
                )
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

            //create dots of participations
            var ud = svg.selectAll("dot").data(d);

            ud.enter()
                .append("circle")
                .merge(u)
                .transition()
                .duration(1000)
                .attr("fill", "#004085")
                .attr("cx", function (d) {
                    return xScale(d.year)
                })
                .attr("cy", function (d) {
                    return yScale(d.p)
                })
                .attr("r", 4)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
        }

        update(dataOfParticipations, 'Teilnahmen');

        uParticipations.onclick = function () {
            console.log("load Participations");
            update(dataOfParticipations, 'Teilnahmen');
        }

        uParticipants.onclick = function () {
            console.log("load Participants");
            update(dataOfParticipants, 'Teilnehmer');
        }
    });
});