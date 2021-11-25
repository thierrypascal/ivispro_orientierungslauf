import Enumerable from '../lib/linq.js-4.0.0/linq.js'

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, each participant should have a line showing the amount of participations per year
    const data = [];
    //TODO: add search functionality to search for specific name
    //Daten werden aus vorbereitetem csv geladen, nicht direkt aus der Hauptquelle
    d3.csv('./data/teilnahmenProPersonLinie.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        const dataOfParticipants = (Enumerable.from(data)
            .select(function (t) {
                return {name: t.name, dob: t.dob, ppY: [
                    {year: '2008', p: t.p2008},
                    {year: '2009', p: t.p2009},
                    {year: '2010', p: t.p2010},
                    {year: '2011', p: t.p2011},
                    {year: '2012', p: t.p2012},
                    {year: '2013', p: t.p2013},
                    {year: '2014', p: t.p2014},
                    {year: '2015', p: t.p2015},
                    {year: '2016', p: t.p2016},
                    {year: '2017', p: t.p2017},
                    {year: '2018', p: t.p2018},
                    {year: '2019', p: t.p2019},
                    {year: '2020', p: t.p2020},
                    ]};
            })
            .toArray());

        console.log(dataOfParticipants);

        //construct graph
        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 1000 - margin.left - margin.right,
            height = 560 - margin.top - margin.bottom,
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
        const yAxisLabel = 'Anzahl Teilnahmen';

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
        yScale.domain([0, 80]);

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

        // create a tooltip
        var Tooltip = d3.select("#ttteilnahmenProPersonLinie")
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
        const mousemove = (name, dob) => function (event, d) {
            //d of line is an array, d of dot is object
            if (d instanceof Array){
                Tooltip
                    .html(name + "<br>" + "Jahrgang " + dob)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`)
            }else{
                Tooltip
                    .html(name + "<br>" + "Jahrgang " + dob + "<br>" + yAxisLabel + ": " + d.p + "<br>" + xAxisLabel + ": " + d.year)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`)
            }
        }
        const mouseleave = function (event, d) {
            Tooltip
                .style("opacity", 0)
        }

        // Highlight the specie that is hovered
        const highlight = (cName, name, dob) => function (event, d) {
            mouseover();

            // d3.selectAll(".dot")
            //     .transition()
            //     .duration(200)
            //     .style("fill", "lightgrey")
            //     .attr("r", 3)
            //
            // d3.selectAll("." + cName + "dot")
            //     .transition()
            //     .duration(200)
            //     .style("fill", color(d))
            //     .attr("r", 7)
            //
            // d3.selectAll(".path")
            //     .transition()
            //     .duration(200)
            //     .style("stroke", "lightgrey")
            //
            // //TODO: move line to front
            d3.selectAll("." + cName + "line")
                .transition()
                .duration(200)
                .style("stroke", color(d))
                .attr("stroke-width", 3.0)
                .attr("opacity", 1)

            const sel = d3.select(this);
            sel.moveToFront();
        }

        // Highlight the specie that is hovered
        const doNotHighlight = (cName) => function (event, d) {
            mouseleave();

            // d3.selectAll(".dot")
            //     .transition()
            //     .duration(200)
            //     .style("fill", d => color(d))
            //     .attr("r", 5)
            //
            // d3.selectAll(".path")
            //     .transition()
            //     .duration(200)
            //     .style("stroke", d => color(d))
            //     .attr("stroke-width", 1.5)
            d3.selectAll("." + cName + "line")
                .transition()
                .duration(200)
                .style("stroke", color(d))
                .attr("stroke-width", 1.5)
                .attr("opacity", 0.5)
        }

        // color palette
        const color = d3.scaleOrdinal()
            .range(['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'])

        //bind data to graph
        //create line of participations
        //TODO: konzept überdenken, pro person eine linie/eine scatter group, wie werden diese über die Höhe unterschieden?

        dataOfParticipants.forEach((t) => {
            const cName = t.name.replace(/\s+/g, '');

            // svg.append("g")
            //     .selectAll("dot")
            //     .data(t.ppY)
            //     .join("circle")
            //     .attr("class", "dot " + cName + "dot")
            //     .attr("cx", d => xScale(d.year))
            //     .attr("cy", d => yScale(d.p))
            //     .attr("r", 5)
            //     .attr("fill", color(d => d))
            //     .on("mouseover", highlight(cName, t.name, t.dob))
            //     .on("mouseleave", doNotHighlight)
            //     .on("mousemove", mousemove(t.name, t.dob))
            //     //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
            //     .attr('transform', 'translate(' + 30 + ',' + 10 + ')');

            //TODO: same color for line and dots
            svg.append("path")
                .datum(t.ppY)
                .attr("class", "path " + cName + "line")
                .attr("fill", "none")
                .attr("stroke", color(d => d))
                .attr("stroke-width", 1.5)
                .attr("opacity", 0.5)
                .attr("d", d3.line()
                    .x(d => xScale(d.year))
                    .y(d => yScale(d.p))
                )
                .on("mouseover", highlight(cName, t.name, t.dob))
                .on("mouseleave", doNotHighlight(cName))
                .on("mousemove", mousemove(t.name, t.dob))
                //TODO: Tooltip for curve with individual points
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
        });
    });
});