/* ============================================================
   Memory Tool — app.js
   Single-file application logic: Model, Controller, View
   ============================================================ */

(function () {
  "use strict";

  // ───────────── Sequence Generator ─────────────

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
      // Fisher-Yates shuffle
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

  // ───────────── Mode Config ─────────────

  const ModeConfig = {
    memorization: [
      { type: "straight", repetitions: 10 },
      { type: "reverse",  repetitions: 5  },
      { type: "jumbled",  repetitions: 10 },
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
      // Return deep copy so originals are never mutated
      return config.map(b => ({ ...b }));
    }
  };

  // ───────────── Session Engine ─────────────

  const SessionEngine = {
    listSize: 0,
    blocks: [],
    currentBlockIndex: 0,
    currentRepetition: 1,
    currentSequence: [],
    sequenceIndex: 0,
    totalPointers: 0,
    pointersCompleted: 0,

    init(listSize, blocks) {
      this.listSize = listSize;
      this.blocks = blocks;
      this.currentBlockIndex = 0;
      this.currentRepetition = 1;
      this.sequenceIndex = 0;
      this.pointersCompleted = 0;

      this.totalPointers = blocks.reduce(
        (sum, b) => sum + listSize * b.repetitions, 0
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

      // End of current sequence?
      if (this.sequenceIndex >= this.currentSequence.length) {
        this.currentRepetition++;
        const block = this.blocks[this.currentBlockIndex];

        // End of current block's repetitions?
        if (this.currentRepetition > block.repetitions) {
          this.currentBlockIndex++;

          // End of all blocks?
          if (this.currentBlockIndex >= this.blocks.length) {
            return null; // session complete
          }

          this.currentRepetition = 1;
        }

        // Generate next sequence
        this.currentSequence = SequenceGenerator.generate(
          this.blocks[this.currentBlockIndex].type, this.listSize
        );
        this.sequenceIndex = 0;
      }

      return this.currentPointer();
    },

    getProgress() {
      const block = this.blocks[this.currentBlockIndex];
      return {
        blockName: block.type.charAt(0).toUpperCase() + block.type.slice(1),
        currentRep: this.currentRepetition,
        totalReps: block.repetitions,
        pointersCompleted: this.pointersCompleted,
        totalPointers: this.totalPointers,
        blocksCompleted: this.currentBlockIndex,
        totalBlocks: this.blocks.length
      };
    },

    isComplete() {
      return this.currentBlockIndex >= this.blocks.length;
    },

    reset() {
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

  // ───────────── Input Validator ─────────────

  const InputValidator = {
    validate(mode, listSize, customBlocks) {
      if (!Number.isInteger(listSize) || listSize < 1 || listSize > 10) {
        return "List size must be between 1 and 10.";
      }

      if (mode === "custom") {
        if (!customBlocks || customBlocks.length === 0) {
          return "Add at least one practice block.";
        }

        for (let i = 0; i < customBlocks.length; i++) {
          const b = customBlocks[i];
          if (!["straight", "reverse", "jumbled"].includes(b.type)) {
            return "Block " + (i + 1) + ": Invalid practice element type.";
          }
          if (!Number.isInteger(b.repetitions) || b.repetitions < 1) {
            return "Block " + (i + 1) + ": Repetition count must be at least 1.";
          }
        }
      }

      return null; // valid
    }
  };

  // ───────────── UI Controller ─────────────

  // Cache DOM references
  const dom = {
    setupScreen:     document.getElementById("setup-screen"),
    practiceScreen:  document.getElementById("practice-screen"),
    completeScreen:  document.getElementById("complete-screen"),

    modeRadios:      document.querySelectorAll('input[name="mode"]'),
    listSizeInput:   document.getElementById("list-size"),
    customSection:   document.getElementById("custom-section"),
    customBlocks:    document.getElementById("custom-blocks"),
    addBlockBtn:     document.getElementById("add-block-btn"),
    errorMessage:    document.getElementById("error-message"),
    startBtn:        document.getElementById("start-btn"),

    pointerDisplay:  document.getElementById("pointer-display"),
    blockInfo:       document.getElementById("block-info"),
    overallProgress: document.getElementById("overall-progress"),
    progressBar:     document.getElementById("progress-bar"),
    nextBtn:         document.getElementById("next-btn"),
    backBtn:         document.getElementById("back-btn"),

    totalPracticed:  document.getElementById("total-practiced"),
    blocksCompleted: document.getElementById("blocks-completed"),
    againBtn:        document.getElementById("again-btn")
  };

  const UIController = {
    showScreen(screen) {
      dom.setupScreen.classList.add("hidden");
      dom.practiceScreen.classList.add("hidden");
      dom.completeScreen.classList.add("hidden");
      screen.classList.remove("hidden");
    },

    showSetupScreen() {
      this.showScreen(dom.setupScreen);
      this.hideError();
    },

    showPracticeScreen() {
      this.showScreen(dom.practiceScreen);
    },

    showCompleteScreen(totalPointers, totalBlocks) {
      dom.totalPracticed.textContent = totalPointers;
      dom.blocksCompleted.textContent = totalBlocks;
      this.showScreen(dom.completeScreen);
    },

    updatePointerDisplay(n) {
      dom.pointerDisplay.textContent = n;
    },

    updateProgress(info) {
      dom.blockInfo.textContent =
        info.blockName + " — Rep " + info.currentRep + " of " + info.totalReps;
      dom.overallProgress.textContent =
        info.pointersCompleted + " / " + info.totalPointers;

      const pct = (info.pointersCompleted / info.totalPointers) * 100;
      dom.progressBar.style.width = pct + "%";
    },

    showError(msg) {
      dom.errorMessage.textContent = msg;
      dom.errorMessage.classList.remove("hidden");
    },

    hideError() {
      dom.errorMessage.classList.add("hidden");
    },

    getSelectedMode() {
      for (const radio of dom.modeRadios) {
        if (radio.checked) return radio.value;
      }
      return "memorization";
    },

    getListSize() {
      return parseInt(dom.listSizeInput.value, 10);
    },

    getCustomBlocks() {
      const rows = dom.customBlocks.querySelectorAll(".block-row");
      const blocks = [];
      rows.forEach(row => {
        const type = row.querySelector("select").value;
        const reps = parseInt(row.querySelector('input[type="number"]').value, 10);
        blocks.push({ type: type, repetitions: reps });
      });
      return blocks;
    },

    addBlockRow() {
      const index = dom.customBlocks.querySelectorAll(".block-row").length + 1;
      const row = document.createElement("div");
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
        UIController.renumberBlocks();
      });

      dom.customBlocks.appendChild(row);
    },

    renumberBlocks() {
      const rows = dom.customBlocks.querySelectorAll(".block-row");
      rows.forEach((row, i) => {
        row.querySelector(".block-label").textContent = (i + 1) + ".";
      });
    },

    toggleCustomSection(show) {
      if (show) {
        dom.customSection.classList.remove("hidden");
        // Seed with one block if empty
        if (dom.customBlocks.querySelectorAll(".block-row").length === 0) {
          this.addBlockRow();
        }
      } else {
        dom.customSection.classList.add("hidden");
      }
    }
  };

  // ───────────── Event Handlers ─────────────

  // Mode radio change — toggle custom section
  dom.modeRadios.forEach(radio => {
    radio.addEventListener("change", function () {
      UIController.toggleCustomSection(this.value === "custom");
      UIController.hideError();
    });
  });

  // Add block button
  dom.addBlockBtn.addEventListener("click", function () {
    UIController.addBlockRow();
  });

  // Start button
  dom.startBtn.addEventListener("click", function () {
    const mode = UIController.getSelectedMode();
    const listSize = UIController.getListSize();
    let blocks;

    if (mode === "custom") {
      blocks = UIController.getCustomBlocks();
    } else {
      blocks = ModeConfig.getBlocks(mode);
    }

    const error = InputValidator.validate(mode, listSize, blocks);
    if (error) {
      UIController.showError(error);
      return;
    }

    UIController.hideError();
    SessionEngine.init(listSize, blocks);

    const pointer = SessionEngine.currentPointer();
    UIController.updatePointerDisplay(pointer);
    UIController.updateProgress(SessionEngine.getProgress());
    UIController.showPracticeScreen();
  });

  // Next button
  dom.nextBtn.addEventListener("click", function () {
    const pointer = SessionEngine.next();

    if (pointer === null) {
      // Session complete
      UIController.showCompleteScreen(
        SessionEngine.totalPointers,
        SessionEngine.blocks.length
      );
      return;
    }

    UIController.updatePointerDisplay(pointer);
    UIController.updateProgress(SessionEngine.getProgress());
  });

  // Back button
  dom.backBtn.addEventListener("click", function () {
    SessionEngine.reset();
    UIController.showSetupScreen();
  });

  // Practice Again button
  dom.againBtn.addEventListener("click", function () {
    SessionEngine.reset();
    UIController.showSetupScreen();
  });

})();
