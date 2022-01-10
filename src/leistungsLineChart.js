import Enumerable from '../lib/linq.js-4.0.0/linq.js'

let searchForm = document.getElementById("searchFormLeistungsLineChart");
let searchInput = document.getElementById("searchInputLeistungsLineChart");

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //TODO: for each year, each participant should have a line showing the average achieved result per year
    const data = [];
    let dataOfParticipants = [];
    let biggestR = 300;
    //Daten werden aus vorbereitetem csv geladen, nicht direkt aus der Hauptquelle
    d3.csv('./data/leistungsLineChart.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        //get data for participations
        function loadDataWithFilter(search) {
            if (search !== null && search !== "") {
                dataOfParticipants = (Enumerable.from(data)
                    .where(function (t) {
                        const n = "" + t.name;
                        return n.includes(search);
                    })
                    .select(function (t) {
                        return {
                            name: t.name, dob: t.dob, rpY: [
                                {year: '2008', r: t.r2008},
                                {year: '2009', r: t.r2009},
                                {year: '2010', r: t.r2010},
                                {year: '2011', r: t.r2011},
                                {year: '2012', r: t.r2012},
                                {year: '2013', r: t.r2013},
                                {year: '2014', r: t.r2014},
                                {year: '2015', r: t.r2015},
                                {year: '2016', r: t.r2016},
                                {year: '2017', r: t.r2017},
                                {year: '2018', r: t.r2018},
                                {year: '2019', r: t.r2019},
                                {year: '2020', r: t.r2020},
                            ]
                        };
                    })
                    .toArray());
            } else {
                dataOfParticipants = (Enumerable.from(data)
                    .select(function (t) {
                        return {
                            name: t.name, dob: t.dob, rpY: [
                                {year: '2008', r: t.r2008},
                                {year: '2009', r: t.r2009},
                                {year: '2010', r: t.r2010},
                                {year: '2011', r: t.r2011},
                                {year: '2012', r: t.r2012},
                                {year: '2013', r: t.r2013},
                                {year: '2014', r: t.r2014},
                                {year: '2015', r: t.r2015},
                                {year: '2016', r: t.r2016},
                                {year: '2017', r: t.r2017},
                                {year: '2018', r: t.r2018},
                                {year: '2019', r: t.r2019},
                                {year: '2020', r: t.r2020},
                            ]
                        };
                    })
                    .toArray());
            }

            biggestR = Enumerable.from(dataOfParticipants)
                .selectMany(t => t.rpY)
                .select(t => parseFloat(t.r))
                .max();
        }

        //construct graph
        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 30},
            width = 1000 - margin.left - margin.right,
            height = 560 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;

        function update(filteredData, maxY) {
            //clear svg bevor redrawing
            d3.selectAll("#leistungsLineChart > *").remove();
            d3.selectAll("#ttleistungsLineChart > *").remove();

            //append the svg object to the html body
            const svg = d3.select('#leistungsLineChart')
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + 20)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //init label
            const xAxisLabel = 'Jahr';
            const yAxisLabel = 'Durchschnittlicher Rang';

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
            yScale.domain([maxY+10, 0]).nice();

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
            var Tooltip = d3.select("#ttleistungsLineChart")
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
                if (d instanceof Array) {
                    Tooltip
                        .html(name + "<br>" + "Jahrgang " + dob)
                        .style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY}px`)
                } else {
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
            const highlight = (cName) => function (event, d) {
                mouseover();

                d3.selectAll("." + cName + "line")
                    .transition()
                    .duration(200)
                    .style("stroke", color(cName))
                    .attr("stroke-width", 3.0)
                    .attr("opacity", 1)

                //move line to front
                const sel = d3.select(this);
                sel.moveToFront();
            }

            // Highlight the specie that is hovered
            const doNotHighlight = (cName) => function (event, d) {
                mouseleave();

                d3.selectAll("." + cName + "line")
                    .transition()
                    .duration(200)
                    .style("stroke", color(cName))
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.4)
            }

            // color palette
            const color = d3.scaleOrdinal(d3.schemeCategory10);

            //bind data to graph
            //create line of participations
            filteredData.forEach((t) => {
                const cName = t.name.replace(/\s+/g, '');

                //TODO: same color for line and dots
                svg.append("path")
                    .datum(t.rpY)
                    .attr("class", "path " + cName + "line")
                    .attr("fill", "none")
                    .attr("stroke", color(cName))
                    .attr("stroke-width", 2.0)
                    .attr("opacity", 0.4)
                    .attr("d", d3.line()
                        .curve(d3.curveBasis)
                        .x(d => xScale(d.year))
                        .y(d => yScale(d.r))
                    )
                    .on("mouseover", highlight(cName))
                    .on("mouseleave", doNotHighlight(cName))
                    .on("mousemove", mousemove(t.name, t.dob))
                    //TODO: Tooltip for curve with individual points
                    //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                    .attr('transform', 'translate(' + 30 + ',' + 10 + ')');
            });
        }

        //init load of graph
        loadDataWithFilter("Odermatt");
        update(dataOfParticipants, biggestR);

        searchForm.onsubmit = function (e) {
            //Todo: search variant with dob groups
            loadDataWithFilter(searchInput.value.toString());
            update(dataOfParticipants, biggestR);
        }
    });
});