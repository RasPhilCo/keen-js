var Dataviz = require('../dataviz'),
    Dataset = require('../../dataset');

var each = require('../../core/utils/each');

module.exports = function(raw){
  this.dataset = parseRawData.call(this, raw);
  return this;
};

function parseRawData(response){
  var self = this,
      schema = {},
      indexBy,
      delimeter,
      indexTarget,
      labelSet,
      labelMap,
      dataType,
      dataset;

  indexBy = self.indexBy() ? self.indexBy() : Dataviz.defaults.indexBy;
  delimeter = Dataset.defaults.delimeter;
  indexTarget = indexBy.split('.').join(delimeter);

  labelSet = self.labels() || null;
  labelMap = self.labelMapping() || null;


  if (typeof response.analysisType !== undefined) {
    dataset, dataType, schema = inferResult(response, indexTarget);
  } else {
    dataset, dataType, schema = resultFromAnalysisType(response, indexTarget);
  }
  dataset = dataset instanceof Dataset ? dataset : new Dataset(response, schema);

  // Set dataType
  if (dataType) {
    self.dataType(dataType);
  }

  return dataset;
}

function resultFromAnalysisType(response, indexTarget) {
  switch(response.analysisType) {
    case "metric":
      return DataTypeParser.metric(response);
      break;
    case "select_unique":
      return DataTypeParser.selectUnique(response);
      break;
  }
}

function inferResult(response, indexTarget) {
  var dataType, schema, dataset;
  // Metric
  // -------------------------------
  if (typeof response.result == 'number'){
    dataType, schema, dataset = DataTypeParser.metric(response);
  }

  // Everything else
  // -------------------------------
  if (response.result instanceof Array && response.result.length > 0){

    // Interval w/ single value
    // -------------------------------
    if (response.result[0].timeframe && (typeof response.result[0].value == 'number' || response.result[0].value == null)) {
      dataType, schema, dataset = DataTypeParser.singleValueInterval(response, indexTarget);
    }

    // Static GroupBy
    // -------------------------------
    if (typeof response.result[0].result == 'number'){
      dataType, schema, dataset = DataTypeParser.staticGroupBy(response);
    }

    // Grouped Interval
    // -------------------------------
    if (response.result[0].value instanceof Array){
      dataType = 'cat-chronological';
      schema = {
        records: 'result',
        unpack: {
          index: {
            path: indexTarget,
            type: 'date'
          },
          value: {
            path: 'value -> result',
            type: 'number'
          }
        }
      }
      for (var key in response.result[0].value[0]){
        if (response.result[0].value[0].hasOwnProperty(key) && key !== 'result'){
          schema.unpack.label = {
            path: 'value -> ' + key,
            type: 'string'
          }
          break;
        }
      }
    }

    // Select Unique
    // -------------------------------
    if (typeof response.result[0] == 'string'){
      dataType, schema, dataset = DataTypeParser.selectUnique(response);
    }

    // Funnel
    // -------------------------------
    if (typeof response.result[0] == 'number' && response.result.steps != undefined){
      dataType = 'cat-ordinal';
      schema = {
        records: '',
        unpack: {
          index: {
            path: 'steps -> event_collection',
            type: 'string'
          },
          value: {
            path: 'result -> ',
            type: 'number'
          }
        }
      }
    }

    // Extraction
    // -------------------------------
    if (dataType === void 0) {
      dataType = 'extraction';
      schema = { records: 'result', select: true };
    }

  }
  return dataset, dataType, schema;
}
