import Enumerable from '../lib/linq.js-4.0.0/linq.js'

let uParticipants = document.getElementById("updateParticipants");
let uParticipations = document.getElementById("updateParticipations");

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, the amount of entries should be counted
    //for each year, the amount of individual participants should be counted
    const data = [];
    //Daten werden aus vorbereitetem csv geladen, nicht direkt aus der Hauptquelle
    d3.csv('./data/algTeilnehmerzahl.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        const dataOfParticipations = Enumerable.from(data)
            .select(function (t) {
                return {year: t.year, participations: t.participations};
            })
            .toArray();

        //get data for participants
        const dataOfParticipants = Enumerable.from(data)
            .select(function (t) {
                return {year: t.year, participants: t.participants};
            })
            .toArray();

        //construct graph
        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 650 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        function update(d, yTitle, isParticipations) {
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
            if (isParticipations){
                yScale.domain([0, 100000]).nice();
            }else{
                yScale.domain([0, 15000]).nice();
            }

            //set x, y-Axis
            const yAxisG = g.append('g').call(yAxis);
            //add label
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
            if (isParticipations){
                svg.append("path").datum(d)
                    .attr("fill", "none")
                    .attr("stroke", "#5091ff")
                    .attr("stroke-width", 3)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.participations))
                    )
                    //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                    .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
            }else{
                svg.append("path").datum(d)
                    .attr("fill", "none")
                    .attr("stroke", "#5091ff")
                    .attr("stroke-width", 3)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.participants))
                    )
                    //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                    .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
            }

            // create a tooltip
            var Tooltip = d3.select("#ttAlgTeilnehmerzahl")
                .append("div")
                .attr("class", "tooltip")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "2px")
                .style("border-radius", "5px")
                .style("padding", "5px")

            // Three function that change the tooltip when user hover / move / leave a cell
            const mouseover = function (event, d) {
                Tooltip
                    .style("opacity", 1)
            }
            const mousemove = function (event, d) {
                if (isParticipations){
                    Tooltip
                        .html(yTitle + ": " + d.participations + "<br>" + "Jahr: " + d.year)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY}px`)
                }else{
                    Tooltip
                        .html(yTitle + ": " + d.participants + "<br>" + "Jahr: " + d.year)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY}px`)
                }
            }
            const mouseleave = function (event, d) {
                Tooltip
                    .style("opacity", 0)
            }

            // Add the points
            if (isParticipations){
                svg.append("g")
                    .selectAll("dot")
                    .data(d)
                    .enter()
                    .append("circle")
                    .attr("class", "myCircle")
                    .attr("cx", d => xScale(d.year))
                    .attr("cy", d => yScale(d.participations))
                    .attr("r", 4)
                    .attr("stroke", "#2253ad")
                    .attr("stroke-width", 2)
                    .attr("fill", "white")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                    .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
            }else{
                svg.append("g")
                    .selectAll("dot")
                    .data(d)
                    .enter()
                    .append("circle")
                    .attr("class", "myCircle")
                    .attr("cx", d => xScale(d.year))
                    .attr("cy", d => yScale(d.participants))
                    .attr("r", 4)
                    .attr("stroke", "#2253ad")
                    .attr("stroke-width", 2)
                    .attr("fill", "white")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave)
                    //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                    .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
            }
        }

        update(dataOfParticipations, 'Teilnahmen', true);

        uParticipations.onclick = function () {
            console.log("load Participations");
            update(dataOfParticipations, 'Teilnahmen', true);
        }

        uParticipants.onclick = function () {
            console.log("load Participants");
            update(dataOfParticipants, 'Teilnehmende', false);
        }
    });
});