var currentShip = null;

function displayStats() {
  if (currentShip) {
    document.querySelector('#shipName').innerText = currentShip.manufacturer + ': ' + currentShip.name;

    // update Module Sizes
    var cm = currentShip.coreModules;
    document.querySelector('#capacitorMaxSize').innerText = cm.capacitorMaxSize;
    document.querySelector('#fuelTankMaxSize').innerText = cm.fuelTankMaxSize;
    document.querySelector('#generatorMaxSize').innerText = cm.generatorMaxSize;
    document.querySelector('#lifeSupportMaxSize').innerText = cm.lifeSupportMaxSize;
    document.querySelector('#thrustersMaxSize').innerText = cm.thrustersMaxSize;
    document.querySelector('#warpCoreMaxSize').innerText = cm.warpCoreMaxSize;

    document.querySelector('#installedCapacitor').innerText = cm.capacitor.size + cm.capacitor.class;
    document.querySelector('#installedFuelTank').innerText = cm.fuelTank.size + cm.fuelTank.class;
    document.querySelector('#installedGenerator').innerText = cm.generator.size + cm.generator.class;
    document.querySelector('#installedLifeSupport').innerText = cm.lifeSupport.size + cm.lifeSupport.class;
    document.querySelector('#installedThrusters').innerText = cm.thrusters.size + cm.thrusters.class;
    document.querySelector('#installedWarpCore').innerText = cm.warpCore.size + cm.warpCore.class;

    var shipMass = currentShip.getTotalMass();
    var shipRange = cm.warpCore.getJumpRange(shipMass);
    var shipFuelMaxJump = cm.warpCore.getFuelNeededForJump(shipMass, shipRange);

    document.querySelector('#shipMass').innerText = shipMass;
    generateJumpChart();
    generateFuelUsedChart();
    var mass = cm.getTotalMass();
    document.querySelector('#maxJumpRange').innerText = cm.warpCore.getJumpRange(mass).toFixed(2);
    document.querySelector('#maxFuel').innerText = cm.fuelTank.maxCapacity;

    document.querySelector('#shipPower').innerText = cm.getTotalPowerConsumed();
    document.querySelector('#maxPower').innerText = cm.generator.power;
    document.querySelector('#shipHeat').innerText = (isNaN(currentShip.getTotalHeat())) ? NaN : currentShip.getTotalHeat().toFixed(2);
    document.querySelector('#maxHeat').innerText = 100;

    // setup Utility Modules
    populateUtilityModuleTable(currentShip.utilityModules.size);
  }
}

function generateJumpChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Mass');
  data.addColumn('number', 'Distance');
  var warpCore = currentShip.coreModules.warpCore;
  var currentMass = currentShip.getTotalMass();
  var massIncrements = warpCore.maximumMass / 10;
  for (var i=0; i<=11; i++) {
    var mass = massIncrements * i;
    data.addRow([mass, warpCore.getJumpRange(mass)]);
  }

  var options = {
    width: 350,
    height: 250,
    backgroundColor: '#868e96',
    legend: 'none',
    hAxis: {title: 'Mass (tonnes)'},
    vAxis: {title: 'Distance (LY)'}
  };

  var chart = new google.visualization.LineChart(document.getElementById('shipJumpRangeChart'));

  chart.draw(data, options);
}

function generateFuelUsedChart() {
  var data = new google.visualization.DataTable();
  data.addColumn('number', 'Distance');
  data.addColumn('number', 'Fuel');
  var warpCore = currentShip.coreModules.warpCore;
  var mass = currentShip.getTotalMass();
  var steps = warpCore.getJumpRange(mass) / 10;
  for (var i=0; i<=11; i++) {
    var dist = steps * i;
    data.addRow([dist, warpCore.getFuelNeededForJump(mass, dist)]);
  }

  var options = {
    width: 350,
    height: 250,
    backgroundColor: '#868e96',
    legend: 'none',
    hAxis: {title: 'Distance (LY)'},
    vAxis: {title: 'Fuel (tonnes)'}
  };

  var chart = new google.visualization.LineChart(document.getElementById('shipJumpFuelChart'));

  chart.draw(data, options);
}

function resetModules() {
  $('#installedCapacitor').removeClass('btn-outline-warning').addClass('btn-warning');
  $('#installedFuelTank').removeClass('btn-outline-warning').addClass('btn-warning');
  $('#installedGenerator').removeClass('btn-outline-warning').addClass('btn-warning');
  $('#installedLifeSupport').removeClass('btn-outline-warning').addClass('btn-warning');
  $('#installedThrusters').removeClass('btn-outline-warning').addClass('btn-warning');
  $('#installedWarpCore').removeClass('btn-outline-warning').addClass('btn-warning');
}

function setShip(shipName) {
  var newShip = SpaceSim.getShip(shipName);
  currentShip = newShip;
  resetModules();
  displayStats();
}

function populateShipList() {
  var manufacterers = {};
  SpaceSim.ships.forEach(function(ship) {
    manufacterers[ship.manufacturer] = true;
  });
  var htmlList = document.querySelector('#shipDropdownList');
  $(htmlList).empty();
  var htmlToAppend = '';
  for (var manufacturerName in manufacterers) {
    if (manufacterers.hasOwnProperty(manufacturerName)) {
      htmlToAppend += '<h4 class="dropdown-header text-light">' + manufacturerName + '</h4>';
      for(var key in SpaceSim.ships) {
        var ship = SpaceSim.ships[key];
        if (ship.manufacturer == manufacturerName) {
          htmlToAppend += '<button onclick="setShip(\'' + ship.name + '\');" type="button" class="btn btn-block btn-outline-warning">' + ship.name + '</button>';
        }
      }
    }
  }
  htmlList.insertAdjacentHTML('beforeend', htmlToAppend);
}

function populateModuleList(tableBody, availableModules) {
  $(tableBody).empty();
  var htmlToAppend = '';
  for (var size=1; size<=8; size++) {
    htmlToAppend += '<tr class="moduleSize' + size + '">';
    var moduleClasses = ['A','B','C','D','E'];
    for(var j=0; j<moduleClasses.length; j++) {
      var availableModuleExists = false;

      // is there a module of the current size and class?
      for (var i=0; i<availableModules.length; i++) {
        var availableModule = availableModules[i];
        if (availableModule.size == size && availableModule.class == moduleClasses[j]) {
          availableModuleExists = true;
          break;
        }
      }
      var sizeClass = size + '' + moduleClasses[j];
      if (availableModuleExists) {
        htmlToAppend += '<td><button sizeclass=\'' + JSON.stringify({'size':size,'class':moduleClasses[j]}) + '\' type="button" class="btn btn-outline-warning">' + sizeClass + '</button></td>';
      } else {
        htmlToAppend += '<td><button type="button" class="btn btn-outline-light disabled" disabled>' + sizeClass + '</button></td>';
      }
    }
    htmlToAppend += '</tr>';
  }
  tableBody.insertAdjacentHTML('beforeend',htmlToAppend);
}

function populateUtilityModuleTable(size) {
  var tableBody = document.querySelector('#utilitiesTableBody');
  var addButton = document.querySelector('#addUtilityModuleButton');
  var availableSpace = document.querySelector('#utilitiesAvailableSpace');
  $(tableBody).empty();
  $(addButton).prop('disabled', true);
  $(availableSpace).empty();

  var htmlToAppend = '';
  // first add existing modules
  var uMods = currentShip.utilityModules.modules;
  var usedSlots = 0;
  for (var j=0; j<uMods.length; j++) {
    var module = uMods[j];
    var moduleSlots = module.size; // how many slots this module will take up
    usedSlots += moduleSlots;
    var moduleName = module.name + ' - ' + module.size + module.class;
    htmlToAppend += '<tr><td>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button id="remove-'+module.id+'" type="button" class="btn btn-warning attachedUtilityModuleClass">-</button>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button type="button" class="btn btn-outline-warning btn-block" disabled>'+module.name+'</button>';
    htmlToAppend += '</div>';
    if (module.enabled) {
      htmlToAppend += '<button id="enabled-'+module.id+'" type="button" class="btn btn-warning installedUtilityModule">'+module.size+module.class+'</button>';
    } else {
      htmlToAppend += '<button id="enabled-'+module.id+'" type="button" class="btn btn-outline-warning installedUtilityModule">'+module.size+module.class+'</button>';
    }
    htmlToAppend += '</div>';
    htmlToAppend += '</td></tr>';
  }
  tableBody.insertAdjacentHTML('beforeend',htmlToAppend);

  // then display used vs. remaining space
  var spaceAvailableHtml = '';
  var remainingSlots = currentShip.utilityModules.size - usedSlots;
  for (var i=0; i<currentShip.utilityModules.size; i++) {
    if (remainingSlots > 0) {
      spaceAvailableHtml += '<a href="#" role="button" id="utilitySlot-' + i + '" class="btn btn-outline-light disabled" disabled>&nbsp;</a>';
      remainingSlots--;
    } else {
      spaceAvailableHtml += '<a href="#" role="button" id="utilitySlot-' + i + '" class="btn btn-warning">&nbsp;</a>';
    }
  }
  availableSpace.insertAdjacentHTML('beforeend',spaceAvailableHtml);

  if (usedSlots < currentShip.utilityModules.size) {
    $(addButton).prop('disabled', false);
  }

  // allow removal of attached utility modules
  $('.attachedUtilityModuleClass').click(function() {
    var idParts = $(this).attr('id').split('remove-');
    if (idParts.length == 2) {
      var id = idParts[1];
      currentShip.utilityModules.remove(id);
    }
    displayStats();
  });
  // allow toggling of enabled state for utility modules
  $('.installedUtilityModule').click(function() {
    var idParts = $(this).attr('id').split('enabled-');
    if (idParts.length == 2) {
      var id = idParts[1];
      if (currentShip.utilityModules.isEnabled(id)) {
        currentShip.utilityModules.setEnabled(id, false);
      } else {
        currentShip.utilityModules.setEnabled(id, true);
      }
    }
    displayStats();
  });
}

function populateCapacitorList() {
  var tableBody = document.querySelector('#capacitorTableBody');
  var available = SpaceSim.coreModules.capacitors;
  populateModuleList(tableBody, available);
}

function populateFuelTankList() {
  var tableBody = document.querySelector('#fuelTankTableBody');
  var available = SpaceSim.coreModules.fuelTanks;
  populateModuleList(tableBody, available);
}

function populateGeneratorList() {
  var tableBody = document.querySelector('#generatorTableBody');
  var available = SpaceSim.coreModules.generators;
  populateModuleList(tableBody, available);
}

function populateLifeSupportList() {
  var tableBody = document.querySelector('#lifeSupportTableBody');
  var available = SpaceSim.coreModules.lifeSupports;
  populateModuleList(tableBody, available);
}

function populateThrustersList() {
  var tableBody = document.querySelector('#thrustersTableBody');
  var available = SpaceSim.coreModules.thrusters;
  populateModuleList(tableBody, available);
}

function populateWarpCoreList() {
  var tableBody = document.querySelector('#warpCoreTableBody');
  var available = SpaceSim.coreModules.warpCores;
  populateModuleList(tableBody, available);
}

$(function() {
  // setup Core Modules
  populateShipList();
  populateCapacitorList();
  populateFuelTankList();
  populateGeneratorList();
  populateLifeSupportList();
  populateThrustersList();
  populateWarpCoreList();

  /** update ship modules **/
  $('#capacitorTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateCapacitor(new SpaceSim.Ships.CoreModules.Capacitor(SpaceSim.getCoreModule('capacitor', sizeClass.size, sizeClass.class)));
    displayStats();
  });
  $('#fuelTankTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateFuelTank(new SpaceSim.Ships.CoreModules.FuelTank(SpaceSim.getCoreModule('fuelTank', sizeClass.size, sizeClass.class)));
    displayStats();
  });
  $('#generatorTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateGenerator(new SpaceSim.Ships.CoreModules.Generator(SpaceSim.getCoreModule('generator', sizeClass.size, sizeClass.class)));
    displayStats();
  });
  $('#lifeSupportTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateLifeSupport(new SpaceSim.Ships.CoreModules.LifeSupport(SpaceSim.getCoreModule('lifeSupport', sizeClass.size, sizeClass.class)));
    displayStats();
  });
  $('#thrustersTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateThrusters(new SpaceSim.Ships.CoreModules.Thrusters(SpaceSim.getCoreModule('thrusters', sizeClass.size, sizeClass.class)));
    displayStats();
  });
  $('#warpCoreTableBody button:not([disabled])').click(function() {
    var sizeClassStr = $(this).attr('sizeClass');
    var sizeClass = JSON.parse(sizeClassStr);
    currentShip.coreModules.updateWarpCore(new SpaceSim.Ships.CoreModules.WarpCore(SpaceSim.getCoreModule('warpCore', sizeClass.size, sizeClass.class)));
    displayStats();
  });

  /** disable ship module **/
  $('#installedCapacitor').click(function() {
    var el = $(this);
    if (el.hasClass('btn-warning')) {
      // disable module
      el.removeClass('btn-warning');
      el.addClass('btn-outline-warning');
      currentShip.coreModules.capacitor.setEnabled(false);
    } else {
      el.removeClass('btn-outline-warning');
      el.addClass('btn-warning');
      currentShip.coreModules.capacitor.setEnabled(true);
    }
    displayStats();
  });
  /**
   * NOTE: fuel tank cannot be disabled
   */
  /**
   * NOTE: generator cannot be disabled
   */
  /**
   * NOTE: life support cannot be disabled
   */
  $('#installedThrusters').click(function() {
    var el = $(this);
    if (el.hasClass('btn-warning')) {
      // disable module
      el.removeClass('btn-warning');
      el.addClass('btn-outline-warning');
      currentShip.coreModules.thrusters.setEnabled(false);
    } else {
      el.removeClass('btn-outline-warning');
      el.addClass('btn-warning');
      currentShip.coreModules.thrusters.setEnabled(true);
    }
    displayStats();
  });
  $('#installedWarpCore').click(function() {
    var el = $(this);
    if (el.hasClass('btn-warning')) {
      // disable module
      el.removeClass('btn-warning');
      el.addClass('btn-outline-warning');
      currentShip.coreModules.warpCore.setEnabled(false);
    } else {
      el.removeClass('btn-outline-warning');
      el.addClass('btn-warning');
      currentShip.coreModules.warpCore.setEnabled(true);
    }
    displayStats();
  });

  google.charts.load('current', {'packages':['corechart']});
});
