var currentShip = null;

function displayStats() {
  if (currentShip) {
    document.querySelector('#shipName').innerText = currentShip.manufacturer + ': ' + currentShip.name;

    // update Core Module display
    var cm = currentShip.coreModules;
    /** Capacitor **/
    document.querySelector('#capacitorMaxSize').innerText = cm.capacitorMaxSize;
    document.querySelector('#installedCapacitor').innerText = cm.capacitor.size + cm.capacitor.class;
    populateCapacitorDropdownList();
    $('#capacitorTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateCapacitor(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });
    /** Fuel Tank **/
    document.querySelector('#fuelTankMaxSize').innerText = cm.fuelTankMaxSize;
    document.querySelector('#installedFuelTank').innerText = cm.fuelTank.size + cm.fuelTank.class;
    populateFuelTankDropdownList();
    $('#fuelTankTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateFuelTank(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });
    /** Generator **/
    document.querySelector('#generatorMaxSize').innerText = cm.generatorMaxSize;
    document.querySelector('#installedGenerator').innerText = cm.generator.size + cm.generator.class;
    populateGeneratorDropdownList();
    $('#generatorTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateGenerator(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });
    /** Life Support **/
    document.querySelector('#lifeSupportMaxSize').innerText = cm.lifeSupportMaxSize;
    document.querySelector('#installedLifeSupport').innerText = cm.lifeSupport.size + cm.lifeSupport.class;
    populateLifeSupportDropdownList();
    $('#lifeSupportTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateLifeSupport(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });
    /** Thrusters **/
    document.querySelector('#thrustersMaxSize').innerText = cm.thrustersMaxSize;
    document.querySelector('#installedThrusters').innerText = cm.thrusters.size + cm.thrusters.class;
    populateThrustersDropdownList();
    $('#thrustersTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateThrusters(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });
    /** Warp Core **/
    document.querySelector('#warpCoreMaxSize').innerText = cm.warpCoreMaxSize;
    document.querySelector('#installedWarpCore').innerText = cm.warpCore.size + cm.warpCore.class;
    populateWarpCoreDropdownList();
    $('#warpCoreTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.coreModules.updateWarpCore(SpaceSim.getCoreModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });

    // update Utility Modules display
    populateUtilitiesDropdownList();
    $('#utilitiesDropdownTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.utilityModules.add(SpaceSim.getUtilityModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });

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

    var capacity = currentShip.getTotalCargoCapacity();
    document.querySelector('#shipCargo').innerText = capacity;
    document.querySelector('#shipLadenWeight').innerText = shipMass + capacity;

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
  var ships = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Ship);
  ships.forEach(function(ship) {
    manufacterers[ship.manufacturer] = true;
  });
  var htmlList = document.querySelector('#shipDropdownList');
  $(htmlList).empty();
  var htmlToAppend = '';
  for (var manufacturerName in manufacterers) {
    if (manufacterers.hasOwnProperty(manufacturerName)) {
      htmlToAppend += '<h4 class="dropdown-header text-light">' + manufacturerName + '</h4>';
      for(var key in ships) {
        var ship = ships[key];
        if (ship.manufacturer == manufacturerName) {
          htmlToAppend += '<button onclick="setShip(\'' + ship.name + '\');" type="button" class="btn btn-block btn-outline-warning">' + ship.name + '</button>';
        }
      }
    }
  }
  htmlList.insertAdjacentHTML('beforeend', htmlToAppend);
}

function populateModuleList(tableBody, availableModules, maxSize) {
  $(tableBody).empty();
  // group by names
  var names = SpaceSim.getModuleOptionNames(availableModules);
  var moduleClasses = ['A','B','C','D','E'];
  var htmlToAppend = '';
  for (var nameKey in names) {
    var name = names[nameKey];
    htmlToAppend += '<tr><td colspan="'+moduleClasses.length+'" class="text-light"><h5>' + name + '</h5></td></tr>';
    // then display one row per size
    for (var size=1; size<=maxSize; size++) {
      htmlToAppend += '<tr class="moduleSize' + size + '">';

      // and one column per class where unavailable classes are displayed disabled
      for(var j=0; j<moduleClasses.length; j++) {
        var availableModuleExists = false;
        var sizeClass = size + '' + moduleClasses[j];
        // is there a module of the current size and class?
        for (var i=0; i<availableModules.length; i++) {
          var availableModule = availableModules[i];
          if (availableModule.size == size && availableModule.class == moduleClasses[j] && availableModule.name == name) {
            availableModuleExists = true;
            htmlToAppend += '<td><button sizeclass=\'' + JSON.stringify({'type':availableModule.type,'subType':availableModule.subType,'size':size,'class':moduleClasses[j]}) + '\' type="button" class="btn btn-outline-warning">' + sizeClass + '</button></td>';
            break;
          }
        }

        if (!availableModuleExists) {
          htmlToAppend += '<td><button type="button" class="btn btn-outline-light disabled" disabled>' + sizeClass + '</button></td>';
        }
      }
      htmlToAppend += '</tr>';
    }
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
      spaceAvailableHtml += '<a href="#" role="button" id="utilitySlot-' + i + '" class="btn btn-warning disabled" disabled>&nbsp;</a>';
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

function populateCapacitorDropdownList() {
  var tableBody = document.querySelector('#capacitorTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Capacitor);
  populateModuleList(tableBody, available, currentShip.coreModules.capacitor.size);
}

function populateFuelTankDropdownList() {
  var tableBody = document.querySelector('#fuelTankTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.FuelTank);
  populateModuleList(tableBody, available, currentShip.coreModules.fuelTank.size);
}

function populateGeneratorDropdownList() {
  var tableBody = document.querySelector('#generatorTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Generator);
  populateModuleList(tableBody, available, currentShip.coreModules.generator.size);
}

function populateLifeSupportDropdownList() {
  var tableBody = document.querySelector('#lifeSupportTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.LifeSupport);
  populateModuleList(tableBody, available, currentShip.coreModules.lifeSupport.size);
}

function populateThrustersDropdownList() {
  var tableBody = document.querySelector('#thrustersTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Thrusters);
  populateModuleList(tableBody, available, currentShip.coreModules.thrusters.size);
}

function populateWarpCoreDropdownList() {
  var tableBody = document.querySelector('#warpCoreTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.WarpCore);
  populateModuleList(tableBody, available, currentShip.coreModules.warpCore.size);
}

function populateUtilitiesDropdownList() {
  var tableBody = document.querySelector('#utilitiesDropdownTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Utility, SpaceSim.ModuleSubTypes.CargoHold);
  // TODO: add more Utility Modules
  populateModuleList(tableBody, available, currentShip.utilityModules.getRemainingSpace());
}

$(function() {
  // setup list of Ships to select from
  populateShipList();

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
