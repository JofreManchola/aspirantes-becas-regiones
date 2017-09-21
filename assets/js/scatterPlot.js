console.clear();
//Revisión por Mayra Jiménez
var dataSet = "https://raw.githubusercontent.com/JofreManchola/aspirantes-becas-regiones/master/assets/data/ASPIRANTES_A_BECAS_DE_FORMACION%20(ASPIRANTES_A_BECAS_DE_FORMACION_DE_ALTO__NIVEL_PARA_LAS_REGIONES_2014_A_OCT_2016)_procesado.csv";
//dirige al dataset utilizado 
data = [];
dataScatterPlot = [];
x = {};
y = {};
colorScale10 = d3.scaleOrdinal(d3.schemeCategory10);
var r = 7;

var dataDom = d3.select("#dataDom");
var getData = function (d) { return d; }
var summarizeScatterPlot = function (dd) {
    var temp = d3.nest()
        .key(function (d) { return d.keyScatterPlot; })
        .rollup(function (d) {
            var t1 = d3.sum(d, function (g) { return 1; });
            var t2 = d[0]['Ano Convo'];
            var t3 = d[0]['Departamento Oferta'];
            return { 'Aspirantes': t1, 'Año': t2, 'Departamento Oferta': t3 }
        }).entries(dd);

    return temp.map(function (datum, index, arr) {
        return datum.value;
    });
}
var summarizeStackedbar = function (dd) {
    var temp = d3.nest()
        .key(function (d) { return d.keyStackedbar; })
        .rollup(function (d) {
            var t1 = d3.sum(d, function (g) { return 1; });
            var t2 = d[0]['Genero Aspirante'];
            var t3 = d[0]['Modalidad'];
            return { 'Aspirantes': t1, 'genero': t2, 'modalidad': t3 }
        })
        .entries(dd)
        .map(function (datum, index, arr) {
            return datum.value;
        });
    // console.log('temp', temp);

    var temp2 = d3.nest()
        .key(function (d) { return d.modalidad; })
        .rollup(function (d) {
            var t1 = {};
            d.map(function (a) {
                t1[a.genero] = a.Aspirantes;
                t1['modalidad'] = a.modalidad
            });
            return t1;
        })
        .entries(temp)
        .map(function (datum, index, arr) {
            return datum.value;
        });
    // console.log('temp2', temp2);
    return temp2;
}

// set the dimensions and margins of the graph
var fullWidth = 600,
    fullHeight = 500,
    margin = { top: 60, right: 20, bottom: 150, left: 100 },
    width = fullWidth - margin.left - margin.right,
    height = fullHeight - margin.top - margin.bottom;

makeScatterPlot = function (dx) {
    var svg = d3.select("#aspirante-depto-anho").append("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .attr("class", "svgScatterPlot")
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dx.sort(function (a, b) { return d3.descending(a.Aspirantes, b.Aspirantes); });

    var x = d3.scaleBand()
        // .domain(getDepartamentos(dx))
        .domain(getDistinct(dx, 'Departamento Oferta', false))
        .rangeRound([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    y.domain([0, d3.max(dx, function (d) { return d.Aspirantes; }) * 1.1]);

    // Add the scatterplot
    svg.selectAll("dot")
        .data(dx)
        .enter().append("circle")
        .attr("r", r)
        .attr("cx", function (d) { return x(d['Departamento Oferta']); })
        .attr("cy", function (d) { return y(d.Aspirantes); })
        .style("fill", function (d, i) { return colorScale10(d['Año']); })
        .on("mousemove", onMouseover)
        .on("mouseout", onMouseout);

    // Add the X Axis
    svg.append("g")
        .attr("class", "gXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-30,20) rotate(-90)")
        .attr("text-anchor", "end")
        .attr("class", "axis_label");

    // Add the Y Axis
    var yaxis = svg.append("g")
        .call(d3.axisLeft(y));
    yaxis.selectAll("text")
        .attr("class", "axis_label");
    yaxis.append("text")
        .text("Cantidad de aspirantes")
        .attr("transform", "translate(" + (-margin.left / 2) + "," + height / 2 + ") rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("class", "axis_title");

    //Creación del título de la gráfica
    svg.append("text")
        .attr("class", "chartTitle")
        .attr("transform", "translate(" + width / 2 + "," + (-margin.top / 2) + ")")
        .text("Aspirantes a ofertas departamentales por año")
        .attr("text-anchor", "middle");
    //.attr("y", heightScale2(heightScale2.ticks().pop()) + 0.5)

    // makeLegend(svg, dx);
    makeLegend(svg, dx, 'Año', colorScale10);
}

/**
 * Construye el Stacked barchar para aspirante-modalidad-genero
 */

//sería más fácil con un stacked horizontal identificar las cantidades en X cantidades y en Y el valor categórico, aunque como colocas las etiquetas al usar el más ayuda
makeStackedbar = function (dx) {
    var keys = ['Masculino', 'Femenino']; // getDistinct(dx, 'modalidad', false);//
    var svg = d3.select("#aspirante-modalidad-genero").append("svg")
        .attr("width", fullWidth)
        .attr("height", fullHeight)
        .attr("class", "svgScatterPlot")
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    dx.sort(function (a, b) {
        var t1 = a.Masculino + a.Femenino;
        var t2 = b.Masculino + b.Femenino;
        return d3.descending(t1, t2);
    });

    xScale = d3.scaleBand()
        .domain(getDistinct(dx, 'modalidad', false))
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear().range([height, 0]);
    yScale.domain([0, d3.max(dx, function (d) { return d.Femenino + d.Masculino; }) * 1.1]);

    // Add the scatterplot
    svg.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(dx))
        .enter().append("g")
        .attr("fill", function (d) { return colorScale10(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("class", "elemento")
        .attr("x", function (d) { return xScale(d.data.modalidad); })
        .attr("y", function (d) { return yScale(d[1]); })
        .attr("height", function (d) { return yScale(d[0]) - yScale(d[1]); })
        .attr("width", xScale.bandwidth() * 0.9)
        .on("mousemove", onMouseover2)
        .on("mouseout", onMouseout);

    // Add the X Axis
    svg.append("g")
        .attr("class", "gXaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(0,0) rotate(-30)")
        .attr("text-anchor", "end")
        .attr("class", "axis_label");

    // Add the Y Axis
    var yaxis = svg.append("g")
        .call(d3.axisLeft(yScale));
    yaxis.selectAll("text")
        .attr("class", "axis_label");
    yaxis.append("text")
        .text("Cantidad de aspirantes")
        .attr("transform", "translate(" + (-margin.left / 2) + "," + height / 2 + ") rotate(-90)")
        .attr("text-anchor", "middle")
        .attr("class", "axis_title");

    //Creación del título de la gráfica
    svg.append("text")
        .attr("class", "chartTitle")
        .attr("transform", "translate(" + width / 2 + "," + (-margin.top / 2) + ")")
        .text("Aspirantes por modalidad y género")
        .attr("text-anchor", "middle");

    // makeLegend(svg, dx, 'genero', colorScale10);
    makeLegend2(svg, keys, colorScale10);
}

var tooltip = d3.select("body").append("div").attr("class", "toolTip");
var onMouseover2 = function (d) {
    var v = Object.keys(d.data).sort();

    tooltip
        .style("left", d3.event.pageX + 50 + "px")
        .style("top", d3.event.pageY - 50 + "px")
        .style("display", "inline-block")
        .html(v.map(function (datum, index, arr) {
            return "<span class='tooltiplabel'>" + datum + ":</span><span class='tooltipvalue'>" + d.data[datum] + "</span>";
        }).join('<br />'));
};

var onMouseover = function (d) {
    tooltip
        .style("left", d3.event.pageX + 50 + "px")
        .style("top", d3.event.pageY - 50 + "px")
        .style("display", "inline-block")
        .html(Object.keys(d).map(function (datum, index, arr) {
            return "<span class='tooltiplabel'>" + datum + ":</span><span class='tooltipvalue'>" + d[datum] + "</span>";
        }).join('<br />'));
};

var onMouseout = function (d) {
    tooltip.style("display", "none");
};

/**
 * 
 * @param {data set} dx 
 * @param {atributo } key 
 */
var getDistinct = function (dx, key, sort) {
    var items = [];
    // console.log('dx', dx);
    dx.map(function (d) {
        if (!items.find(function (k) { return d[key] == k; })) {
            items.push(d[key]);
        }
    })
    if (sort) {
        items.sort(function (a, b) { return d3.ascending(a, b); });
    }
    return items;
}

var makeLegend = function (svg, dx, label, colorScale) {

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(getDistinct(dx, label, true).slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(-110," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", fullWidth - 20)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

    legend.append("text")
        .attr("x", fullWidth - 25)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
}

var makeLegend2 = function (svg, labels, colorScale) {

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(labels.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(-110," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", fullWidth - 20)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

    legend.append("text")
        .attr("x", fullWidth - 25)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
}

d3.tsv(dataSet,
    // Row
    function row(d) {
        d.keyScatterPlot = d['Ano Convo'] + d['Departamento Oferta'];
        d.keyStackedbar = d['Genero Aspirante'] + d['Modalidad'];
        return d;
    },
    //callback
    function (error, csv_data) {
        if (error) throw error;
        data = getData(csv_data);
        dataScatterPlot = summarizeScatterPlot(csv_data);
        dataStackedbar = summarizeStackedbar(csv_data);

        console.log("data", data);
        console.log("dataScatterPlot", dataScatterPlot);
        console.log("dataStackedbar", dataStackedbar);
        makeScatterPlot(dataScatterPlot);
        makeStackedbar(dataStackedbar);
        console.log("finish...");

    });
