/* ============================================================
   Memory Tool — app.js
   Single-file application logic: Model, Controller, View
   Supports List and Map tabs with independent session flows.
   ============================================================ */

(function () {
  "use strict";

  // ───────────── Sequence Generator (Shared) ─────────────

  const SequenceGenerator = {
    straight(n) {
      const arr = [];
      for (let i = 1; i <= n; i++) arr.push(i);
      return arr;
    },

    reverse(n) {
      const arr = [];
      for (let i = n; i >= 1; i--) arr.push(i);
      return arr;
    },

    jumbled(n) {
      const arr = this.straight(n);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },

    generate(type, n) {
      switch (type) {
        case "straight": return this.straight(n);
        case "reverse":  return this.reverse(n);
        case "jumbled":  return this.jumbled(n);
        default:         return this.straight(n);
      }
    }
  };

  // ───────────── List Mode Config ─────────────

  const ListModeConfig = {
    memorization: [
      { type: "straight", repetitions: 10 },
      { type: "reverse",  repetitions: 10 },
      { type: "jumbled",  repetitions: 5  },
      { type: "straight", repetitions: 5  }
    ],
    revision: [
      { type: "straight", repetitions: 5 },
      { type: "reverse",  repetitions: 3 },
      { type: "jumbled",  repetitions: 5 },
      { type: "straight", repetitions: 3 }
    ],

    getBlocks(mode) {
      const config = this[mode];
      if (!config) return null;
      return config.map(function (b) { return { type: b.type, repetitions: b.repetitions }; });
    }
  };

  // ───────────── Map Mode Config ─────────────

  const MapModeConfig = {
    memorization: [
      { type: "straight", direction: "K2V", repetitions: 10 },
      { type: "reverse",  direction: "K2V", repetitions: 10 },
      { type: "jumbled",  direction: "K2V", repetitions: 5  },
      { type: "straight", direction: "K2V", repetitions: 5  },
      { type: "straight", direction: "V2K", repetitions: 10 },
      { type: "reverse",  direction: "V2K", repetitions: 10 },
      { type: "jumbled",  direction: "V2K", repetitions: 5  },
      { type: "straight", direction: "V2K", repetitions: 5  }
    ],
    revision: [
      { type: "straight", direction: "K2V", repetitions: 5 },
      { type: "reverse",  direction: "K2V", repetitions: 3 },
      { type: "jumbled",  direction: "K2V", repetitions: 5 },
      { type: "straight", direction: "K2V", repetitions: 3 },
      { type: "straight", direction: "V2K", repetitions: 5 },
      { type: "reverse",  direction: "V2K", repetitions: 3 },
      { type: "jumbled",  direction: "V2K", repetitions: 5 },
      { type: "straight", direction: "V2K", repetitions: 3 }
    ],

    getBlocks(mode) {
      const config = this[mode];
      if (!config) return null;
      return config.map(function (b) {
        return { type: b.type, direction: b.direction, repetitions: b.repetitions };
      });
    }
  };

  // ───────────── List Session Engine ─────────────

  const ListSessionEngine = {
    listName: "",
    listSize: 0,
    blocks: [],
    currentBlockIndex: 0,
    currentRepetition: 1,
    currentSequence: [],
    sequenceIndex: 0,
    totalPointers: 0,
    pointersCompleted: 0,

    init(listName, listSize, blocks) {
      this.listName = listName;
      this.listSize = listSize;
      this.blocks = blocks;
      this.currentBlockIndex = 0;
      this.currentRepetition = 1;
      this.sequenceIndex = 0;
      this.pointersCompleted = 0;

      this.totalPointers = blocks.reduce(
        function (sum, b) { return sum + listSize * b.repetitions; }, 0
      );

      this.currentSequence = SequenceGenerator.generate(
        this.blocks[0].type, this.listSize
      );
    },

    currentPointer() {
      return this.currentSequence[this.sequenceIndex];
    },

    next() {
      this.pointersCompleted++;
      this.sequenceIndex++;

      if (this.sequenceIndex >= this.currentSequence.length) {
        this.currentRepetition++;
        var block = this.blocks[this.currentBlockIndex];

        if (this.currentRepetition > block.repetitions) {
          this.currentBlockIndex++;

          if (this.currentBlockIndex >= this.blocks.length) {
            return null;
          }

          this.currentRepetition = 1;
        }

        this.currentSequence = SequenceGenerator.generate(
          this.blocks[this.currentBlockIndex].type, this.listSize
        );
        this.sequenceIndex = 0;
      }

      return this.currentPointer();
    },

    getProgress() {
      var block = this.blocks[this.currentBlockIndex];
      return {
        blockName: block.type.charAt(0).toUpperCase() + block.type.slice(1),
        currentRep: this.currentRepetition,
        totalReps: block.repetitions,
        pointersCompleted: this.pointersCompleted,
        totalPointers: this.totalPointers,
        blocksCompleted: this.currentBlockIndex,
        totalBlocks: this.blocks.length,
        listName: this.listName
      };
    },

    isComplete() {
      return this.currentBlockIndex >= this.blocks.length;
    },

    reset() {
      this.listName = "";
      this.listSize = 0;
      this.blocks = [];
      this.currentBlockIndex = 0;
      this.currentRepetition = 1;
      this.currentSequence = [];
      this.sequenceIndex = 0;
      this.totalPointers = 0;
      this.pointersCompleted = 0;
    }
  };

  // ───────────── Map Session Engine ─────────────

  const MapSessionEngine = {
    mapName: "",
    pairs: [],
    mapSize: 0,
    blocks: [],
    currentBlockIndex: 0,
    currentRepetition: 1,
    currentSequence: [],
    sequenceIndex: 0,
    totalItems: 0,
    itemsCompleted: 0,

    init(mapName, pairs, blocks) {
      this.mapName = mapName;
      this.pairs = pairs;
      this.mapSize = pairs.length;
      this.blocks = blocks;
      this.currentBlockIndex = 0;
      this.currentRepetition = 1;
      this.sequenceIndex = 0;
      this.itemsCompleted = 0;

      this.totalItems = blocks.reduce(
        function (sum, b) { return sum + pairs.length * b.repetitions; }, 0
      );

      this.currentSequence = SequenceGenerator.generate(
        this.blocks[0].type, this.mapSize
      );
    },

    currentItem() {
      var index = this.currentSequence[this.sequenceIndex];
      var block = this.blocks[this.currentBlockIndex];
      var pair = this.pairs[index - 1];
      if (block.direction === "K2V") {
        return { display: pair.key, direction: "K2V" };
      }
      return { display: pair.value, direction: "V2K" };
    },

    next() {
      this.itemsCompleted++;
      this.sequenceIndex++;

      if (this.sequenceIndex >= this.currentSequence.length) {
        this.currentRepetition++;
        var block = this.blocks[this.currentBlockIndex];

        if (this.currentRepetition > block.repetitions) {
          this.currentBlockIndex++;

          if (this.currentBlockIndex >= this.blocks.length) {
            return null;
          }

          this.currentRepetition = 1;
        }

        this.currentSequence = SequenceGenerator.generate(
          this.blocks[this.currentBlockIndex].type, this.mapSize
        );
        this.sequenceIndex = 0;
      }

      return this.currentItem();
    },

    getProgress() {
      var block = this.blocks[this.currentBlockIndex];
      var typeName = block.type.charAt(0).toUpperCase() + block.type.slice(1);
      return {
        blockName: typeName + " " + block.direction,
        currentRep: this.currentRepetition,
        totalReps: block.repetitions,
        itemsCompleted: this.itemsCompleted,
        totalItems: this.totalItems,
        blocksCompleted: this.currentBlockIndex,
        totalBlocks: this.blocks.length,
        mapName: this.mapName
      };
    },

    isComplete() {
      return this.currentBlockIndex >= this.blocks.length;
    },

    reset() {
      this.mapName = "";
      this.pairs = [];
      this.mapSize = 0;
      this.blocks = [];
      this.currentBlockIndex = 0;
      this.currentRepetition = 1;
      this.currentSequence = [];
      this.sequenceIndex = 0;
      this.totalItems = 0;
      this.itemsCompleted = 0;
    }
  };

  // ───────────── List Input Validator ─────────────

  const ListInputValidator = {
    validate(listName, mode, listSize, customBlocks) {
      if (!listName || listName.trim() === "") {
        return "Please enter a list name.";
      }
      if (!Number.isInteger(listSize) || listSize < 1) {
        return "List size must be a valid positive number.";
      }

      if (mode === "custom") {
        if (!customBlocks || customBlocks.length === 0) {
          return "Add at least one practice block.";
        }
        for (var i = 0; i < customBlocks.length; i++) {
          var b = customBlocks[i];
          if (!["straight", "reverse", "jumbled"].includes(b.type)) {
            return "Block " + (i + 1) + ": Invalid practice element type.";
          }
          if (!Number.isInteger(b.repetitions) || b.repetitions < 1) {
            return "Block " + (i + 1) + ": Repetition count must be at least 1.";
          }
        }
      }

      return null;
    }
  };

  // ───────────── Map Input Validator ─────────────

  const MapInputValidator = {
    validate(mapName, mode, pairs, customBlocks) {
      if (!mapName || mapName.trim() === "") {
        return "Please enter a mapping name.";
      }
      if (!pairs || pairs.length === 0) {
        return "Add at least one key-value pair.";
      }
      for (var i = 0; i < pairs.length; i++) {
        if (!pairs[i].key || pairs[i].key.trim() === "") {
          return "Pair " + (i + 1) + ": Key cannot be empty.";
        }
        if (!pairs[i].value || pairs[i].value.trim() === "") {
          return "Pair " + (i + 1) + ": Value cannot be empty.";
        }
      }

      if (mode === "custom") {
        if (!customBlocks || customBlocks.length === 0) {
          return "Add at least one practice block.";
        }
        var validTypes = [
          "straight-k2v", "straight-v2k",
          "reverse-k2v", "reverse-v2k",
          "jumbled-k2v", "jumbled-v2k"
        ];
        for (var j = 0; j < customBlocks.length; j++) {
          var b = customBlocks[j];
          var combo = b.type + "-" + b.direction.toLowerCase();
          if (!validTypes.includes(combo)) {
            return "Block " + (j + 1) + ": Invalid practice element type.";
          }
          if (!Number.isInteger(b.repetitions) || b.repetitions < 1) {
            return "Block " + (j + 1) + ": Repetition count must be at least 1.";
          }
        }
      }

      return null;
    }
  };

  // ───────────── Map Data IO (Import / Export) ─────────────

  const MapDataIO = {
    validateSchema(data) {
      if (!data || typeof data !== "object") {
        return "Invalid JSON structure.";
      }
      if (typeof data.mapping_name !== "string" || data.mapping_name.trim() === "") {
        return "JSON must contain a non-empty 'mapping_name' string.";
      }
      if (!Array.isArray(data.mappings) || data.mappings.length === 0) {
        return "JSON must contain a non-empty 'mappings' array.";
      }
      for (var i = 0; i < data.mappings.length; i++) {
        var m = data.mappings[i];
        if (typeof m.source !== "string" || m.source.trim() === "") {
          return "Mapping " + (i + 1) + ": 'source' must be a non-empty string.";
        }
        if (typeof m.target !== "string" || m.target.trim() === "") {
          return "Mapping " + (i + 1) + ": 'target' must be a non-empty string.";
        }
      }
      return null;
    },

    importJSON(file, onSuccess, onError) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var data;
        try {
          data = JSON.parse(e.target.result);
        } catch (_) {
          onError("Invalid JSON file.");
          return;
        }

        var schemaError = MapDataIO.validateSchema(data);
        if (schemaError) {
          onError(schemaError);
          return;
        }

        onSuccess({
          name: data.mapping_name,
          pairs: data.mappings.map(function (m) {
            return { key: m.source, value: m.target };
          })
        });
      };
      reader.onerror = function () {
        onError("Failed to read the file.");
      };
      reader.readAsText(file);
    },

    exportJSON(name, pairs) {
      var data = {
        mapping_name: name,
        mappings: pairs.map(function (p) {
          return { source: p.key, target: p.value };
        })
      };
      var json = JSON.stringify(data, null, 4);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = (name.replace(/[^a-zA-Z0-9_-]/g, "_") || "mapping") + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // ───────────── Practice Config Loader ─────────────

  const PractiseConfigLoader = {
    buildListBlocks(jsonBlocks) {
      return jsonBlocks.map(function (b) {
        return { type: b.type.toLowerCase(), repetitions: b.repetitions };
      });
    },

    buildMapBlocks(jsonBlocks) {
      var blocks = [];
      ["K2V", "V2K"].forEach(function (dir) {
        jsonBlocks.forEach(function (b) {
          blocks.push({ type: b.type.toLowerCase(), direction: dir, repetitions: b.repetitions });
        });
      });
      return blocks;
    },

    buildDescription(jsonBlocks) {
      return jsonBlocks.map(function (b) {
        return b.repetitions + " " + b.type;
      }).join(" → ");
    },

    load() {
      var self = this;
      fetch("practise_config.json")
        .then(function (response) {
          if (!response.ok) throw new Error("Failed to load config");
          return response.json();
        })
        .then(function (config) {
          if (config.List) {
            if (config.List.Memorization) {
              ListModeConfig.memorization = self.buildListBlocks(config.List.Memorization);
              dom.listModeMemDesc.textContent = self.buildDescription(config.List.Memorization);
            }
            if (config.List.Revision) {
              ListModeConfig.revision = self.buildListBlocks(config.List.Revision);
              dom.listModeRevDesc.textContent = self.buildDescription(config.List.Revision);
            }
          }

          if (config.Map) {
            if (config.Map.Memorization) {
              MapModeConfig.memorization = self.buildMapBlocks(config.Map.Memorization);
              dom.mapModeMemDesc.textContent = "K2V: " + self.buildDescription(config.Map.Memorization) + " | V2K: same";
            }
            if (config.Map.Revision) {
              MapModeConfig.revision = self.buildMapBlocks(config.Map.Revision);
              dom.mapModeRevDesc.textContent = "K2V: " + self.buildDescription(config.Map.Revision) + " | V2K: same";
            }
          }
        })
        .catch(function (err) {
          console.warn("PractiseConfigLoader: Using hardcoded defaults.", err.message);
        });
    }
  };

  // ───────────── DOM References ─────────────

  var dom = {
    // Tab navigation
    tabBtns:              document.querySelectorAll(".tab-btn"),
    listTab:              document.getElementById("list-tab"),
    mapTab:               document.getElementById("map-tab"),

    // List setup
    listSetupScreen:      document.getElementById("list-setup-screen"),
    listPracticeScreen:   document.getElementById("list-practice-screen"),
    listCompleteScreen:   document.getElementById("list-complete-screen"),
    listNameInput:        document.getElementById("list-name"),
    listModeRadios:       document.querySelectorAll('input[name="list-mode"]'),
    listSizeInput:        document.getElementById("list-size"),
    listCustomSection:    document.getElementById("list-custom-section"),
    listCustomBlocks:     document.getElementById("list-custom-blocks"),
    listAddBlockBtn:      document.getElementById("list-add-block-btn"),
    listErrorMessage:     document.getElementById("list-error-message"),
    listStartBtn:         document.getElementById("list-start-btn"),

    // List practice
    listPointerDisplay:   document.getElementById("list-pointer-display"),
    listNameDisplay:      document.getElementById("list-name-display"),
    listBlockInfo:        document.getElementById("list-block-info"),
    listOverallProgress:  document.getElementById("list-overall-progress"),
    listProgressBar:      document.getElementById("list-progress-bar"),
    listNextBtn:          document.getElementById("list-next-btn"),
    listBackBtn:          document.getElementById("list-back-btn"),

    // List complete
    listTotalPracticed:   document.getElementById("list-total-practiced"),
    listBlocksCompleted:  document.getElementById("list-blocks-completed"),
    listAgainBtn:         document.getElementById("list-again-btn"),

    // Map setup
    mapSetupScreen:       document.getElementById("map-setup-screen"),
    mapPracticeScreen:    document.getElementById("map-practice-screen"),
    mapCompleteScreen:    document.getElementById("map-complete-screen"),
    mapNameInput:         document.getElementById("map-name"),
    mapModeRadios:        document.querySelectorAll('input[name="map-mode"]'),
    mapPairs:             document.getElementById("map-pairs"),
    mapAddPairBtn:        document.getElementById("map-add-pair-btn"),
    mapImportBtn:         document.getElementById("map-import-btn"),
    mapImportFile:        document.getElementById("map-import-file"),
    mapExportBtn:         document.getElementById("map-export-btn"),
    mapCustomSection:     document.getElementById("map-custom-section"),
    mapCustomBlocks:      document.getElementById("map-custom-blocks"),
    mapAddBlockBtn:       document.getElementById("map-add-block-btn"),
    mapErrorMessage:      document.getElementById("map-error-message"),
    mapStartBtn:          document.getElementById("map-start-btn"),

    // Map practice
    mapPointerDisplay:    document.getElementById("map-pointer-display"),
    mapNameDisplay:       document.getElementById("map-name-display"),
    mapBlockInfo:         document.getElementById("map-block-info"),
    mapOverallProgress:   document.getElementById("map-overall-progress"),
    mapProgressBar:       document.getElementById("map-progress-bar"),
    mapNextBtn:           document.getElementById("map-next-btn"),
    mapBackBtn:           document.getElementById("map-back-btn"),

    // Map complete
    mapTotalPracticed:    document.getElementById("map-total-practiced"),
    mapBlocksCompleted:   document.getElementById("map-blocks-completed"),
    mapAgainBtn:          document.getElementById("map-again-btn"),

    // Mode descriptions
    listModeMemDesc:      document.getElementById("list-mode-memorization-desc"),
    listModeRevDesc:      document.getElementById("list-mode-revision-desc"),
    mapModeMemDesc:       document.getElementById("map-mode-memorization-desc"),
    mapModeRevDesc:       document.getElementById("map-mode-revision-desc")
  };

  // ───────────── Tab Manager ─────────────

  var activeTab = "list";

  const TabManager = {
    switchTab(tabId) {
      activeTab = tabId;

      dom.tabBtns.forEach(function (btn) {
        if (btn.dataset.tab === tabId) {
          btn.classList.add("tab-active");
        } else {
          btn.classList.remove("tab-active");
        }
      });

      if (tabId === "list") {
        dom.listTab.classList.remove("hidden");
        dom.mapTab.classList.add("hidden");
      } else {
        dom.mapTab.classList.remove("hidden");
        dom.listTab.classList.add("hidden");
      }
    },

    getActiveTab() {
      return activeTab;
    },

    setEnabled(enabled) {
      dom.tabBtns.forEach(function (btn) {
        btn.disabled = !enabled;
        if (enabled) {
          btn.classList.remove("tab-disabled");
        } else {
          btn.classList.add("tab-disabled");
        }
      });
    }
  };

  // ───────────── UI Controller ─────────────

  const UIController = {
    // --- List screen management ---
    showListScreen(screen) {
      dom.listSetupScreen.classList.add("hidden");
      dom.listPracticeScreen.classList.add("hidden");
      dom.listCompleteScreen.classList.add("hidden");
      screen.classList.remove("hidden");
    },

    showListSetupScreen() {
      this.showListScreen(dom.listSetupScreen);
      this.hideListError();
      TabManager.setEnabled(true);
    },

    showListPracticeScreen() {
      this.showListScreen(dom.listPracticeScreen);
      TabManager.setEnabled(false);
    },

    showListCompleteScreen(totalPointers, totalBlocks) {
      dom.listTotalPracticed.textContent = totalPointers;
      dom.listBlocksCompleted.textContent = totalBlocks;
      this.showListScreen(dom.listCompleteScreen);
      TabManager.setEnabled(true);
    },

    updateListDisplay(pointer) {
      dom.listPointerDisplay.textContent = pointer;
    },

    updateListNameDisplay(name) {
      dom.listNameDisplay.textContent = name;
    },

    updateListProgress(info) {
      dom.listBlockInfo.textContent =
        info.blockName + " — Rep " + info.currentRep + " of " + info.totalReps;
      dom.listOverallProgress.textContent =
        info.pointersCompleted + " / " + info.totalPointers;
      var pct = (info.pointersCompleted / info.totalPointers) * 100;
      dom.listProgressBar.style.width = pct + "%";
    },

    showListError(msg) {
      dom.listErrorMessage.textContent = msg;
      dom.listErrorMessage.classList.remove("hidden");
    },

    hideListError() {
      dom.listErrorMessage.classList.add("hidden");
    },

    getListMode() {
      for (var i = 0; i < dom.listModeRadios.length; i++) {
        if (dom.listModeRadios[i].checked) return dom.listModeRadios[i].value;
      }
      return "memorization";
    },

    getListSize() {
      return parseInt(dom.listSizeInput.value, 10);
    },

    getListName() {
      return dom.listNameInput.value;
    },

    getListCustomBlocks() {
      var rows = dom.listCustomBlocks.querySelectorAll(".block-row");
      var blocks = [];
      rows.forEach(function (row) {
        var type = row.querySelector("select").value;
        var reps = parseInt(row.querySelector('input[type="number"]').value, 10);
        blocks.push({ type: type, repetitions: reps });
      });
      return blocks;
    },

    addListBlockRow() {
      var index = dom.listCustomBlocks.querySelectorAll(".block-row").length + 1;
      var row = document.createElement("div");
      row.className = "block-row";
      row.innerHTML =
        '<span class="block-label">' + index + '.</span>' +
        '<select>' +
          '<option value="straight">Straight</option>' +
          '<option value="reverse">Reverse</option>' +
          '<option value="jumbled">Jumbled</option>' +
        '</select>' +
        '<span class="block-label">×</span>' +
        '<input type="number" min="1" value="3">' +
        '<button type="button" class="btn-remove" title="Remove block">✕</button>';

      row.querySelector(".btn-remove").addEventListener("click", function () {
        row.remove();
        UIController.renumberBlocks(dom.listCustomBlocks);
      });

      dom.listCustomBlocks.appendChild(row);
    },

    toggleListCustomSection(show) {
      if (show) {
        dom.listCustomSection.classList.remove("hidden");
        if (dom.listCustomBlocks.querySelectorAll(".block-row").length === 0) {
          this.addListBlockRow();
        }
      } else {
        dom.listCustomSection.classList.add("hidden");
      }
    },

    // --- Map screen management ---
    showMapScreen(screen) {
      dom.mapSetupScreen.classList.add("hidden");
      dom.mapPracticeScreen.classList.add("hidden");
      dom.mapCompleteScreen.classList.add("hidden");
      screen.classList.remove("hidden");
    },

    showMapSetupScreen() {
      this.showMapScreen(dom.mapSetupScreen);
      this.hideMapError();
      TabManager.setEnabled(true);
    },

    showMapPracticeScreen() {
      this.showMapScreen(dom.mapPracticeScreen);
      TabManager.setEnabled(false);
    },

    showMapCompleteScreen(totalItems, totalBlocks) {
      dom.mapTotalPracticed.textContent = totalItems;
      dom.mapBlocksCompleted.textContent = totalBlocks;
      this.showMapScreen(dom.mapCompleteScreen);
      TabManager.setEnabled(true);
    },

    updateMapDisplay(text) {
      dom.mapPointerDisplay.textContent = text;
    },

    updateMapNameDisplay(name) {
      dom.mapNameDisplay.textContent = name;
    },

    updateMapProgress(info) {
      dom.mapBlockInfo.textContent =
        info.blockName + " — Rep " + info.currentRep + " of " + info.totalReps;
      dom.mapOverallProgress.textContent =
        info.itemsCompleted + " / " + info.totalItems;
      var pct = (info.itemsCompleted / info.totalItems) * 100;
      dom.mapProgressBar.style.width = pct + "%";
    },

    showMapError(msg) {
      dom.mapErrorMessage.textContent = msg;
      dom.mapErrorMessage.classList.remove("hidden");
    },

    hideMapError() {
      dom.mapErrorMessage.classList.add("hidden");
    },

    getMapMode() {
      for (var i = 0; i < dom.mapModeRadios.length; i++) {
        if (dom.mapModeRadios[i].checked) return dom.mapModeRadios[i].value;
      }
      return "memorization";
    },

    getMapName() {
      return dom.mapNameInput.value;
    },

    getMapPairs() {
      var rows = dom.mapPairs.querySelectorAll(".pair-row");
      var pairs = [];
      rows.forEach(function (row) {
        pairs.push({
          key: row.querySelector(".pair-key").value,
          value: row.querySelector(".pair-value").value
        });
      });
      return pairs;
    },

    getMapCustomBlocks() {
      var rows = dom.mapCustomBlocks.querySelectorAll(".block-row");
      var blocks = [];
      rows.forEach(function (row) {
        var combo = row.querySelector("select").value;
        var reps = parseInt(row.querySelector('input[type="number"]').value, 10);
        var parts = combo.split("-");
        blocks.push({ type: parts[0], direction: parts[1].toUpperCase(), repetitions: reps });
      });
      return blocks;
    },

    addMapPairRow(prefillKey, prefillValue) {
      var row = document.createElement("div");
      row.className = "pair-row";
      row.innerHTML =
        '<input type="text" class="pair-key" placeholder="Key">' +
        '<span class="pair-arrow">→</span>' +
        '<input type="text" class="pair-value" placeholder="Value">' +
        '<button type="button" class="btn-remove" title="Remove pair">✕</button>';

      if (prefillKey !== undefined)  row.querySelector(".pair-key").value = prefillKey;
      if (prefillValue !== undefined) row.querySelector(".pair-value").value = prefillValue;

      row.querySelector(".btn-remove").addEventListener("click", function () {
        row.remove();
      });

      dom.mapPairs.appendChild(row);
    },

    addMapBlockRow() {
      var index = dom.mapCustomBlocks.querySelectorAll(".block-row").length + 1;
      var row = document.createElement("div");
      row.className = "block-row";
      row.innerHTML =
        '<span class="block-label">' + index + '.</span>' +
        '<select>' +
          '<option value="straight-k2v">Straight K2V</option>' +
          '<option value="straight-v2k">Straight V2K</option>' +
          '<option value="reverse-k2v">Reverse K2V</option>' +
          '<option value="reverse-v2k">Reverse V2K</option>' +
          '<option value="jumbled-k2v">Jumbled K2V</option>' +
          '<option value="jumbled-v2k">Jumbled V2K</option>' +
        '</select>' +
        '<span class="block-label">×</span>' +
        '<input type="number" min="1" value="3">' +
        '<button type="button" class="btn-remove" title="Remove block">✕</button>';

      row.querySelector(".btn-remove").addEventListener("click", function () {
        row.remove();
        UIController.renumberBlocks(dom.mapCustomBlocks);
      });

      dom.mapCustomBlocks.appendChild(row);
    },

    toggleMapCustomSection(show) {
      if (show) {
        dom.mapCustomSection.classList.remove("hidden");
        if (dom.mapCustomBlocks.querySelectorAll(".block-row").length === 0) {
          this.addMapBlockRow();
        }
      } else {
        dom.mapCustomSection.classList.add("hidden");
      }
    },

    // --- Shared helpers ---
    renumberBlocks(container) {
      var rows = container.querySelectorAll(".block-row");
      rows.forEach(function (row, i) {
        row.querySelector(".block-label").textContent = (i + 1) + ".";
      });
    }
  };

  // ───────────── Event Handlers: Tabs ─────────────

  dom.tabBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      TabManager.switchTab(btn.dataset.tab);
    });
  });

  // ───────────── Event Handlers: List Tab ─────────────

  // Mode radio change
  dom.listModeRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      UIController.toggleListCustomSection(this.value === "custom");
      UIController.hideListError();
    });
  });

  // Add block button
  dom.listAddBlockBtn.addEventListener("click", function () {
    UIController.addListBlockRow();
  });

  // Start button
  dom.listStartBtn.addEventListener("click", function () {
    var mode = UIController.getListMode();
    var listName = UIController.getListName();
    var listSize = UIController.getListSize();
    var blocks;

    if (mode === "custom") {
      blocks = UIController.getListCustomBlocks();
    } else {
      blocks = ListModeConfig.getBlocks(mode);
    }

    var error = ListInputValidator.validate(listName, mode, listSize, blocks);
    if (error) {
      UIController.showListError(error);
      return;
    }

    UIController.hideListError();
    ListSessionEngine.init(listName, listSize, blocks);

    var pointer = ListSessionEngine.currentPointer();
    UIController.updateListDisplay(pointer);
    UIController.updateListNameDisplay(listName);
    UIController.updateListProgress(ListSessionEngine.getProgress());
    UIController.showListPracticeScreen();
  });

  // Next button
  dom.listNextBtn.addEventListener("click", function () {
    var pointer = ListSessionEngine.next();

    if (pointer === null) {
      UIController.showListCompleteScreen(
        ListSessionEngine.totalPointers,
        ListSessionEngine.blocks.length
      );
      return;
    }

    UIController.updateListDisplay(pointer);
    UIController.updateListProgress(ListSessionEngine.getProgress());
  });

  // Back button
  dom.listBackBtn.addEventListener("click", function () {
    ListSessionEngine.reset();
    UIController.showListSetupScreen();
  });

  // Practice Again button
  dom.listAgainBtn.addEventListener("click", function () {
    ListSessionEngine.reset();
    UIController.showListSetupScreen();
  });

  // ───────────── Event Handlers: Map Tab ─────────────

  // Mode radio change
  dom.mapModeRadios.forEach(function (radio) {
    radio.addEventListener("change", function () {
      UIController.toggleMapCustomSection(this.value === "custom");
      UIController.hideMapError();
    });
  });

  // Add pair button
  dom.mapAddPairBtn.addEventListener("click", function () {
    UIController.addMapPairRow();
  });

  // Add block button
  dom.mapAddBlockBtn.addEventListener("click", function () {
    UIController.addMapBlockRow();
  });

  // Start button
  dom.mapStartBtn.addEventListener("click", function () {
    var mode = UIController.getMapMode();
    var mapName = UIController.getMapName();
    var pairs = UIController.getMapPairs();
    var blocks;

    if (mode === "custom") {
      blocks = UIController.getMapCustomBlocks();
    } else {
      blocks = MapModeConfig.getBlocks(mode);
    }

    var error = MapInputValidator.validate(mapName, mode, pairs, blocks);
    if (error) {
      UIController.showMapError(error);
      return;
    }

    UIController.hideMapError();
    MapSessionEngine.init(mapName, pairs, blocks);

    var item = MapSessionEngine.currentItem();
    UIController.updateMapDisplay(item.display);
    UIController.updateMapNameDisplay(mapName);
    UIController.updateMapProgress(MapSessionEngine.getProgress());
    UIController.showMapPracticeScreen();
  });

  // Next button
  dom.mapNextBtn.addEventListener("click", function () {
    var item = MapSessionEngine.next();

    if (item === null) {
      UIController.showMapCompleteScreen(
        MapSessionEngine.totalItems,
        MapSessionEngine.blocks.length
      );
      return;
    }

    UIController.updateMapDisplay(item.display);
    UIController.updateMapProgress(MapSessionEngine.getProgress());
  });

  // Back button
  dom.mapBackBtn.addEventListener("click", function () {
    MapSessionEngine.reset();
    UIController.showMapSetupScreen();
  });

  // Practice Again button
  dom.mapAgainBtn.addEventListener("click", function () {
    MapSessionEngine.reset();
    UIController.showMapSetupScreen();
  });

  // ───────────── Event Handlers: Map Import / Export ─────────────

  // Import JSON button — trigger hidden file input
  dom.mapImportBtn.addEventListener("click", function () {
    UIController.hideMapError();
    dom.mapImportFile.value = "";
    dom.mapImportFile.click();
  });

  // File selected — read and populate form
  dom.mapImportFile.addEventListener("change", function () {
    var file = this.files[0];
    if (!file) return;

    MapDataIO.importJSON(file,
      function onSuccess(result) {
        // Set mapping name
        dom.mapNameInput.value = result.name;

        // Clear existing pair rows
        dom.mapPairs.innerHTML = "";

        // Add pair rows from imported data
        result.pairs.forEach(function (pair) {
          UIController.addMapPairRow(pair.key, pair.value);
        });

        UIController.hideMapError();
      },
      function onError(msg) {
        UIController.showMapError(msg);
      }
    );
  });

  // Export JSON button
  dom.mapExportBtn.addEventListener("click", function () {
    UIController.hideMapError();
    var mapName = UIController.getMapName();
    var pairs = UIController.getMapPairs();

    if (!mapName || mapName.trim() === "") {
      UIController.showMapError("Enter a mapping name before exporting.");
      return;
    }
    if (!pairs || pairs.length === 0) {
      UIController.showMapError("Add at least one key-value pair before exporting.");
      return;
    }

    MapDataIO.exportJSON(mapName, pairs);
  });

  // ───────────── Load Practice Config ─────────────

  PractiseConfigLoader.load();

})();
