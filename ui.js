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

    // update Defense Modules display
    populateDefenseDropdownList();
    $('#defenseDropdownTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.defenseModules.add(SpaceSim.getDefenseModule(sizeClass.subType, sizeClass.size, sizeClass.class));
      displayStats();
    });

    // update Weapon Modules display
    populateWeaponDropdownList();
    $('#weaponDropdownTableBody button:not([disabled])').click(function() {
      var sizeClassStr = $(this).attr('sizeClass');
      var sizeClass = JSON.parse(sizeClassStr);
      currentShip.weaponModules.add(SpaceSim.getWeaponModule(sizeClass.subType, sizeClass.size, sizeClass.class));
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

    // setup Defense Modules
    populateDefenseModuleTable(currentShip.defenseModules.size);

    // setup Weapon Modules
    populateWeaponModuleTable(currentShip.weaponModules.size);

    displayCostsTable(currentShip);
  }
}

function displayCostsTable(ship) {
  var tableBody = document.querySelector('#costsTableBody');
  $(tableBody).empty();

  var htmlToAppend = '';
  var totalCost = 0;

  htmlToAppend += '<tr><td>' + SpaceSim.getShipSize(ship) + '</td><td>' + ship.name + '</td><td>' + ship.cost + '</td></tr>';
  totalCost += ship.cost;
  /* capacitor */
  htmlToAppend += '<tr><td>' + ship.coreModules.capacitor.size + ship.coreModules.capacitor.class + '</td><td>' + ship.coreModules.capacitor.name + '</td><td>' + ship.coreModules.capacitor.cost + '</td></tr>';
  totalCost += ship.coreModules.capacitor.cost;
  /* fuelTank */
  htmlToAppend += '<tr><td>' + ship.coreModules.fuelTank.size + ship.coreModules.fuelTank.class + '</td><td>' + ship.coreModules.fuelTank.name + '</td><td>' + ship.coreModules.fuelTank.cost + '</td></tr>';
  totalCost += ship.coreModules.fuelTank.cost;
  /* generator */
  htmlToAppend += '<tr><td>' + ship.coreModules.generator.size + ship.coreModules.generator.class + '</td><td>' + ship.coreModules.generator.name + '</td><td>' + ship.coreModules.generator.cost + '</td></tr>';
  totalCost += ship.coreModules.generator.cost;
  /* lifeSupport */
  htmlToAppend += '<tr><td>' + ship.coreModules.lifeSupport.size + ship.coreModules.lifeSupport.class + '</td><td>' + ship.coreModules.lifeSupport.name + '</td><td>' + ship.coreModules.lifeSupport.cost + '</td></tr>';
  totalCost += ship.coreModules.lifeSupport.cost;
  /* thrusters */
  htmlToAppend += '<tr><td>' + ship.coreModules.thrusters.size + ship.coreModules.thrusters.class + '</td><td>' + ship.coreModules.thrusters.name + '</td><td>' + ship.coreModules.thrusters.cost + '</td></tr>';
  totalCost += ship.coreModules.thrusters.cost;
  /* warpCore */
  htmlToAppend += '<tr><td>' + ship.coreModules.warpCore.size + ship.coreModules.warpCore.class + '</td><td>' + ship.coreModules.warpCore.name + '</td><td>' + ship.coreModules.warpCore.cost + '</td></tr>';
  totalCost += ship.coreModules.warpCore.cost;

  for (var utilityKey in ship.utilityModules.modules) {
    var utilityModule = ship.utilityModules.modules[utilityKey];
    htmlToAppend += '<tr><td>' + utilityModule.size + utilityModule.class + '</td><td>' + utilityModule.name + '</td><td>' + utilityModule.cost + '</td></tr>';
    totalCost += utilityModule.cost;
  }

  for (var defenseKey in ship.defenseModules.modules) {
    var defenseModule = ship.defenseModules.modules[defenseKey];
    htmlToAppend += '<tr><td>' + defenseModule.size + defenseModule.class + '</td><td>' + defenseModule.name + '</td><td>' + defenseModule.cost + '</td></tr>';
    totalCost += defenseModule.cost;
  }

  for (var weaponKey in ship.weaponModules.modules) {
    var weaponModule = ship.weaponModules.modules[weaponKey];
    htmlToAppend += '<tr><td>' + weaponModule.size + weaponModule.class + '</td><td>' + weaponModule.name + '</td><td>' + weaponModule.cost + '</td></tr>';
    totalCost += weaponModule.cost;
  }

  tableBody.insertAdjacentHTML('beforeend', htmlToAppend);
  document.querySelector('#costsTableFootTotal').innerText = totalCost;
}

function generateJumpChart() {
  var warpCore = currentShip.coreModules.warpCore;
  var currentMass = currentShip.getTotalMass();
  var massIncrements = warpCore.maximumMass / 10;
  var xyPoints = [];
  for (var i=10; i>0; i--) {
    var mass = massIncrements * i;
    xyPoints.push({x: warpCore.getJumpRange(mass), y: mass});
  }

  $('#shipJumpRangeChart').empty();
  var jumpChart = new Chartist.Line('#shipJumpRangeChart', {
    series: [
      xyPoints, // series-a
      [{x: warpCore.getJumpRange(currentMass), y: currentMass}] // series-b
    ]
  }, {
    fullWidth: true,
    axisX: {
      type: Chartist.AutoScaleAxis,
      onlyInteger: true
    },
    plugins: [
      Chartist.plugins.ctAxisTitle({
        axisX: {
          axisTitle: 'Distance (LY)',
          axisClass: 'ct-axis-title',
          offset: {
            x: 0,
            y: 30
          },
          textAnchor: 'middle'
        },
        axisY: {
          axisTitle: 'Mass (tonnes)',
          axisClass: 'ct-axis-title',
          textAnchor: 'middle',
          offset: {
            x: 0,
            y: 0
          },
          flipTitle: false
        }
      })
    ]
  });
}

function generateFuelUsedChart() {
  var warpCore = currentShip.coreModules.warpCore;
  var mass = currentShip.getTotalMass();
  var steps = warpCore.getJumpRange(mass) / 10;
  var xyPoints = [];
  for (var i=0; i<=10; i++) {
    var dist = steps * i;
    xyPoints.push({x: dist, y: warpCore.getFuelNeededForJump(mass, dist)});
  }

  $('#shipJumpFuelChart').empty();
  var jumpChart = new Chartist.Line('#shipJumpFuelChart', {
    series: [
      xyPoints, // series-a
    ]
  }, {
    fullWidth: true,
    axisX: {
      type: Chartist.AutoScaleAxis,
      onlyInteger: true
    },
    plugins: [
      Chartist.plugins.ctAxisTitle({
        axisX: {
          axisTitle: 'Distance (LY)',
          axisClass: 'ct-axis-title',
          offset: {
            x: 0,
            y: 30
          },
          textAnchor: 'middle'
        },
        axisY: {
          axisTitle: 'Fuel (tonnes)',
          axisClass: 'ct-axis-title',
          textAnchor: 'middle',
          offset: {
            x: 0,
            y: 0
          },
          flipTitle: false
        }
      })
    ]
  });
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

  $('.card-body').show();

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
    htmlToAppend += '<tr><td colspan="'+moduleClasses.length+'" class="text-light"><h6>' + name + '</h6></td></tr>';
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
    htmlToAppend += '<button id="remove-'+module.id+'" type="button" class="btn btn-warning attachedUtilityModuleClass" data-toggle="tooltip" data-placement="top" title="click to remove module">-</button>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button type="button" class="btn btn-outline-warning btn-block" disabled>'+module.name+'</button>';
    htmlToAppend += '</div>';
    var state = 'btn-warning';
    if (!module.enabled) {
      state = 'btn-outline-warning';
    }
    htmlToAppend += '<button id="enabled-'+module.id+'" type="button" class="btn '+state+' installedUtilityModule" data-toggle="tooltip" data-placement="right" title="click to toggle module enabled state">'+module.size+module.class+'</button>';
    htmlToAppend += '</div>';
    htmlToAppend += '</td></tr>';
  }
  tableBody.insertAdjacentHTML('beforeend',htmlToAppend);

  // then display used vs. remaining space
  var spaceAvailableHtml = '';
  var remainingSlots = currentShip.utilityModules.size - usedSlots;
  for (var i=0; i<currentShip.utilityModules.size; i++) {
    if (remainingSlots > 0) {
      spaceAvailableHtml += '<a href="#" role="button" id="utilitySlot-' + i + '" class="btn btn-sm btn-outline-light disabled" disabled>&nbsp;</a>';
      remainingSlots--;
    } else {
      spaceAvailableHtml += '<a href="#" role="button" id="utilitySlot-' + i + '" class="btn btn-sm btn-warning disabled" disabled>&nbsp;</a>';
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

function populateDefenseModuleTable(size) {
  var tableBody = document.querySelector('#defenseTableBody');
  var addButton = document.querySelector('#addDefenseModuleButton');
  var availableSpace = document.querySelector('#defenseAvailableSpace');
  $(tableBody).empty();
  $(addButton).prop('disabled', true);
  $(availableSpace).empty();

  var htmlToAppend = '';
  // first add existing modules
  var uMods = currentShip.defenseModules.modules;
  var usedSlots = 0;
  for (var j=0; j<uMods.length; j++) {
    var module = uMods[j];
    var moduleSlots = module.size; // how many slots this module will take up
    usedSlots += moduleSlots;
    var moduleName = module.name + ' - ' + module.size + module.class;
    htmlToAppend += '<tr><td>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button id="remove-'+module.id+'" type="button" class="btn btn-warning attachedDefenseModuleClass" data-toggle="tooltip" data-placement="top" title="click to remove module">-</button>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button type="button" class="btn btn-outline-warning btn-block" disabled>'+module.name+'</button>';
    htmlToAppend += '</div>';
    var state = 'btn-warning';
    if (!module.enabled) {
      state = 'btn-outline-warning';
    }
    htmlToAppend += '<button id="enabled-'+module.id+'" type="button" class="btn '+state+' installedDefenseModule" data-toggle="tooltip" data-placement="right" title="click to toggle module enabled state">'+module.size+module.class+'</button>';
    htmlToAppend += '</div>';
    htmlToAppend += '</td></tr>';
  }
  tableBody.insertAdjacentHTML('beforeend',htmlToAppend);

  // then display used vs. remaining space
  var spaceAvailableHtml = '';
  var remainingSlots = currentShip.defenseModules.size - usedSlots;
  for (var i=0; i<currentShip.defenseModules.size; i++) {
    if (remainingSlots > 0) {
      spaceAvailableHtml += '<a href="#" role="button" id="defenseSlot-' + i + '" class="btn btn-sm btn-outline-light disabled" disabled>&nbsp;</a>';
      remainingSlots--;
    } else {
      spaceAvailableHtml += '<a href="#" role="button" id="defenseSlot-' + i + '" class="btn btn-sm btn-warning disabled" disabled>&nbsp;</a>';
    }
  }
  availableSpace.insertAdjacentHTML('beforeend',spaceAvailableHtml);

  if (usedSlots < currentShip.defenseModules.size) {
    $(addButton).prop('disabled', false);
  }

  // allow removal of attached defense modules
  $('.attachedDefenseModuleClass').click(function() {
    var idParts = $(this).attr('id').split('remove-');
    if (idParts.length == 2) {
      var id = idParts[1];
      currentShip.defenseModules.remove(id);
    }
    displayStats();
  });
  // allow toggling of enabled state for defense modules
  $('.installedDefenseModule').click(function() {
    var idParts = $(this).attr('id').split('enabled-');
    if (idParts.length == 2) {
      var id = idParts[1];
      if (currentShip.defenseModules.isEnabled(id)) {
        currentShip.defenseModules.setEnabled(id, false);
      } else {
        currentShip.defenseModules.setEnabled(id, true);
      }
    }
    displayStats();
  });
}

function populateWeaponModuleTable(size) {
  var tableBody = document.querySelector('#weaponTableBody');
  var addButton = document.querySelector('#addWeaponModuleButton');
  var availableSpace = document.querySelector('#weaponAvailableSpace');
  $(tableBody).empty();
  $(addButton).prop('disabled', true);
  $(availableSpace).empty();

  var htmlToAppend = '';
  // first add existing modules
  var uMods = currentShip.weaponModules.modules;
  var usedSlots = 0;
  for (var j=0; j<uMods.length; j++) {
    var module = uMods[j];
    var moduleSlots = module.size; // how many slots this module will take up
    usedSlots += moduleSlots;
    var moduleName = module.name + ' - ' + module.size + module.class;
    htmlToAppend += '<tr><td>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button id="remove-'+module.id+'" type="button" class="btn btn-warning attachedWeaponModuleClass" data-toggle="tooltip" data-placement="top" title="click to remove module">-</button>';
    htmlToAppend += '<div class="btn-group btn-block" role="group">';
    htmlToAppend += '<button type="button" class="btn btn-outline-warning btn-block" disabled>'+module.name+'</button>';
    htmlToAppend += '</div>';
    var state = 'btn-warning';
    if (!module.enabled) {
      state = 'btn-outline-warning';
    }
    htmlToAppend += '<button id="enabled-'+module.id+'" type="button" class="btn '+state+' installedWeaponModule" data-toggle="tooltip" data-placement="right" title="click to toggle module enabled state">'+module.size+module.class+'</button>';
    htmlToAppend += '</div>';
    htmlToAppend += '</td></tr>';
  }
  tableBody.insertAdjacentHTML('beforeend',htmlToAppend);

  // then display used vs. remaining space
  var spaceAvailableHtml = '';
  var remainingSlots = currentShip.weaponModules.size - usedSlots;
  for (var i=0; i<currentShip.weaponModules.size; i++) {
    if (remainingSlots > 0) {
      spaceAvailableHtml += '<a href="#" role="button" id="weaponSlot-' + i + '" class="btn btn-sm btn-outline-light disabled" disabled>&nbsp;</a>';
      remainingSlots--;
    } else {
      spaceAvailableHtml += '<a href="#" role="button" id="weaponSlot-' + i + '" class="btn btn-sm btn-warning disabled" disabled>&nbsp;</a>';
    }
  }
  availableSpace.insertAdjacentHTML('beforeend',spaceAvailableHtml);

  if (usedSlots < currentShip.weaponModules.size) {
    $(addButton).prop('disabled', false);
  }

  // allow removal of attached defense modules
  $('.attachedWeaponModuleClass').click(function() {
    var idParts = $(this).attr('id').split('remove-');
    if (idParts.length == 2) {
      var id = idParts[1];
      currentShip.weaponModules.remove(id);
    }
    displayStats();
  });
  // allow toggling of enabled state for defense modules
  $('.installedWeaponModule').click(function() {
    var idParts = $(this).attr('id').split('enabled-');
    if (idParts.length == 2) {
      var id = idParts[1];
      if (currentShip.weaponModules.isEnabled(id)) {
        currentShip.weaponModules.setEnabled(id, false);
      } else {
        currentShip.weaponModules.setEnabled(id, true);
      }
    }
    displayStats();
  });
}

function populateCapacitorDropdownList() {
  var tableBody = document.querySelector('#capacitorTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Capacitor);
  populateModuleList(tableBody, available, currentShip.coreModules.capacitorMaxSize);
}

function populateFuelTankDropdownList() {
  var tableBody = document.querySelector('#fuelTankTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.FuelTank);
  populateModuleList(tableBody, available, currentShip.coreModules.fuelTankMaxSize);
}

function populateGeneratorDropdownList() {
  var tableBody = document.querySelector('#generatorTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Generator);
  populateModuleList(tableBody, available, currentShip.coreModules.generatorMaxSize);
}

function populateLifeSupportDropdownList() {
  var tableBody = document.querySelector('#lifeSupportTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.LifeSupport);
  populateModuleList(tableBody, available, currentShip.coreModules.lifeSupportMaxSize);
}

function populateThrustersDropdownList() {
  var tableBody = document.querySelector('#thrustersTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.Thrusters);
  populateModuleList(tableBody, available, currentShip.coreModules.thrustersMaxSize);
}

function populateWarpCoreDropdownList() {
  var tableBody = document.querySelector('#warpCoreTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Core, SpaceSim.ModuleSubTypes.WarpCore);
  populateModuleList(tableBody, available, currentShip.coreModules.warpCoreMaxSize);
}

function populateUtilitiesDropdownList() {
  var tableBody = document.querySelector('#utilitiesDropdownTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Utility);
  populateModuleList(tableBody, available, currentShip.utilityModules.getRemainingSpace());
}

function populateDefenseDropdownList() {
  var tableBody = document.querySelector('#defenseDropdownTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Defense);
  populateModuleList(tableBody, available, currentShip.defenseModules.getRemainingSpace());
}

function populateWeaponDropdownList() {
  var tableBody = document.querySelector('#weaponDropdownTableBody');
  var available = SpaceSim.getModuleOptionsByType(SpaceSim.ModuleTypes.Weapon);
  populateModuleList(tableBody, available, currentShip.weaponModules.getRemainingSpace());
}

$(function() {
  $('[data-toggle="tooltip"]').tooltip();

  // setup list of Ships to select from
  populateShipList();

  $('.card-body').hide();

  $('.card-header').click(function() {
    var name = $(this).attr('for');
    var el = $('[name=' + name + ']');
    if (el.is(':visible')) {
      el.hide();
    } else {
      if (currentShip) {
        el.show();
        displayStats();
      }
    }
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
});
