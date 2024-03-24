const { priceScheduler, pricesScheduler, savePrices } = require('./schedulers/priceScheduler');
const { swapEventsHook, getSwapEventsFromBlockNumber } = require('./schedulers/swapEventsScheduler');
const fs = require('fs');
const { managerSwapsData } = require('./schedulers/swapManager');
const { getStakingTVL, saveStakingTVL } = require('./schedulers/stakingScheduler');
const { getTotalLiquidAssetsOnChain, saveTotalLiquidAssetsOnChain } = require('./schedulers/totalLiquidAssetsOnChainScheduler');

var express = require('express'),
    app = express(),
    port = process.env.PORT || 8080,// if un exposed port execute : sudo ufw allow 8080
    cors = require('cors'),
    bodyParser = require('body-parser');

/////////////////////////////////////////////////////////////////////////
//Json BodyParser
/////////////////////////////////////////////////////////////////////////

var allowedOrigins = ['*'];

app.use(cors({
    origin: function(origin, callback) {
      // allow requests with no origin 
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf('*') === -1 && allowedOrigins.indexOf(origin) === -1) {
        var msg = 'The CORS policy for this site does not ' +
                  'allow access from the specified Origin.';
        console.log('Origin blocked by CORS policy ', origin);
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    }
}));


JSON.parseAll = (v) => { try { return typeof v == "string" ? JSON.parse(v) : v; } catch (x) { return v; } }
String.prototype.isEmpty = function() { return (this == ""); };
String.prototype.nonEmpty = function() { return (this != ""); };
String.prototype.fixStringNumberOfCharacters = function(l = 10) { var r = ""; for (var i = 0; i < (l + 1); i++) { if (this.length > i) { r += this[i]; } else if (this.length == i) { r += " "; } else { r += "."; } } return r; }


/////////////////////////////////////////////////////////////////////////
//Json BodyParser
/////////////////////////////////////////////////////////////////////////

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Plugins:
[
    require("./plugins/swagger/swagger"),
    require("./plugins/event/fire"),
    require('./plugins/scheduler/scheduler'),
    () => {
      /** @FireEventHandler ON_SCHEDULE_CREATE */
      app.fire.create("ON_SCHEDULE_CREATE", (models) => {
        console.log("Start scheduleTime (1000)");
        // creation of the main analytics directory storage
        if (!fs.existsSync('./analytics')) {
          fs.mkdirSync('./analytics');
        }
        app.scheduler.create("mainScheduler", '*/60 * * * *', () => app.fire.call["ON_SCHEDULE"](), true);
      });

      app.fire.create("ON_SCHEDULE", async () => {
        console.log("scheduleTime");

        try {
          const stakingTVL = await getStakingTVL();
          saveStakingTVL(stakingTVL);
        } catch (e) {
          console.error('Staking TVL Scheduler', e);
        }

        try {
          const tvl = await getTotalLiquidAssetsOnChain();
          saveTotalLiquidAssetsOnChain(tvl);
        } catch (e) {
          console.error('Total Liquid Assets On Chain Scheduler', e);
        }

        try {
          const data = await pricesScheduler();
          savePrices(data);
        } catch (e) {
          console.error('Prices Scheduler', e);
        }

      });
    },
    require('./routes')
].forEach(plugin => plugin(app));

/////////////////////////////////////////////////////////////////////////
//Start Server
/////////////////////////////////////////////////////////////////////////

app.listen(port);

console.log('Allowed origins            : ', allowedOrigins);
console.log('API server started on port : ', port);
app.fire.call["ON_SCHEDULE_CREATE"]();

(async () => {
  await managerSwapsData((newSwap) => {
    console.log('New Swap', newSwap);
  });
})();