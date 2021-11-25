import Enumerable from '../lib/linq.js-4.0.0/linq.js'

let stopBtn = document.getElementById("stopAnimationDemograf");
let startBtn = document.getElementById("startAnimationDemograf");

document.addEventListener("DOMContentLoaded", function (event) {
    //create data
    //for each year, the amount of entries per birthdate should be counted
    //for each year, the amount of individual participants per birthday should be counted
    const data = [];
    let dataOfParticipations = [];
    let subgroupDataOfParticipants = [];
    let xAxisLabel;
    let yAxisLabel;
    d3.csv('./data/demografischeTeilnehmerzahl.csv').then((t) => {
        for (let i = 0; i < t.length; i++) {
            data.push(t[i]);
        }

        function loadDataOfYear(year) {
            //get data for participations
            dataOfParticipations = Enumerable.from(data)
                .where(function (t) {
                    return t.year === year;
                })
                .select(function (t) {
                    return {dob: t.dob, participations: parseInt(t.participations)};
                })
                .toArray();

            //get data for participations
            subgroupDataOfParticipants = Enumerable.from(data)
                .where(function (t) {
                    return t.year === year;
                })
                .select(function (t) {
                    return {dob: t.dob, participants: parseInt(t.participants)};
                })
                .toArray();

            //init label
            yAxisLabel = 'Jahrgang';
            xAxisLabel = 'Teilnehmer:innen (Rot) / Teilnahmen (blau) im Jahr ' + year;
        }

        //construct graph

        //set dimensions and margin of the graph
        const margin = {top: 10, right: 40, bottom: 20, left: 60},
            width = 800 - margin.left - margin.right,
            height = 1200 - margin.top - margin.bottom,
            innerWidth = width - margin.left - margin.right,
            innerHeight = height - margin.top - margin.bottom;


        function update(mainDataSet, subgroupDataSet) {
            //clear svg bevor redrawing
            d3.selectAll("#demografischeTeilnehmerzahl > *").remove();
            d3.selectAll("#ttdemografischeTeilnehmerzahl > *").remove();

            //append the svg object to the html body
            const svg = d3.select('#demografischeTeilnehmerzahl')
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + 20)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            //set pixel range/scale
            let xScale = d3.scaleLinear().range([0, innerWidth]);
            let yScale = d3.scaleBand().range([innerHeight, 0]);

            const g = svg.append('g')
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");

            //create x, y-Axis
            const xAxis = d3.axisBottom(xScale)
                .ticks(10)
                .tickFormat(d3.format("d"))
                .tickPadding(15);

            const yAxis = d3.axisLeft(yScale)
                .tickPadding(10)
                .tickFormat(d3.format('d'))

            //set data range
            xScale.domain([0, 3500]);
            yScale.domain(mainDataSet.map(d => d.dob)).padding(.1);

            //set x, y-Axis
            const yAxisG = g.append('g').call(yAxis);
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

            g.append('g').call(xAxis)
                .attr('transform', `translate(0,${innerHeight})`);

            // create a tooltip
            var Tooltip = d3.select("#ttdemografischeTeilnehmerzahl")
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
            const mousemoveMain = function (event, d) {
                Tooltip
                    .html("Teilnahmen: " + d.participations + "<br>" + "Jahrgang: " + d.dob)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`)
                    .style("border-color", "#004085")
            }
            const mousemoveSub = function (event, d) {
                Tooltip
                    .html("Teilnehmende: " + d.participants + "<br>" + "Jahrgang: " + d.dob)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY}px`)
                    .style("border-color", "#ff1b2e")
            }
            const mouseleave = function (event, d) {
                Tooltip
                    .style("opacity", 0)
            }


            //bind data to graph
            svg.selectAll("rect")
                .data(mainDataSet)
                .enter()
                .append("rect")
                .attr("x", xScale(0))
                .attr("y", d => yScale(d.dob))
                .attr("width", d => xScale(d.participations))
                .attr("height", yScale.bandwidth())
                .on("mouseover", mouseover)
                .on("mousemove", mousemoveMain)
                .on("mouseleave", mouseleave)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 60 + ',' + 10 + ')')
                .attr("fill", "#004085");

            svg.append("g")
                .selectAll("rect")
                .data(subgroupDataSet)
                .enter()
                .append("rect")
                .attr("x", xScale(0))
                .attr("y", d => yScale(d.dob))
                .attr("width", d => xScale(d.participants))
                .attr("height", yScale.bandwidth())
                .on("mouseover", mouseover)
                .on("mousemove", mousemoveSub)
                .on("mouseleave", mouseleave)
                //verschieben der Punkte um auf dem Grid zu liegen bzw. margin aufzuheben
                .attr('transform', 'translate(' + 60 + ',' + 10 + ')')
                .attr("fill", "#ff1b2e");
        }

        //First time loading
        loadDataOfYear("2008");
        update(dataOfParticipations, subgroupDataOfParticipants);

        //simple animation handling
        let interval = window.setInterval(loadForEachYear, 5000);
        let year = 2009;

        function loadForEachYear() {
            if (year <= 2020) {
                console.log("show data of year " + year);
                loadDataOfYear(year.toString());
                update(dataOfParticipations, subgroupDataOfParticipants);
                year += 1;
            } else {
                year = 2008;
            }
        }

        startBtn.onclick = function () {
            console.log("Animation started");
            clearInterval(interval);
            interval = window.setInterval(loadForEachYear, 5000);
        }

        stopBtn.onclick = function () {
            console.log("Animation stopped");
            clearInterval(interval);
        }
    });
});