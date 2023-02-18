const SteamUser = require("steam-user");
const SteamTotp = require("steam-totp");
const SteamCommunity = require("steamcommunity");
const TradeOfferManager = require("steam-tradeoffer-manager");

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
	steam : client,
	community: community,
	language: "en"
});

const config = {
	"userA":process.env.STEAM_USER_NAME,
	"passwordA":process.env.STEAM_PASSWORD,
	"sharedSecretA":process.env.STEAM_SHARED_SECRET,
	"identitySecretA": process.env.STEAM_IDENTITY_SECRET,
	"steamID":process.env.STEAM_ID,
	"adminID":process.env.STEAM_ADMIN_ID
};


const logOnOption = {
	accountName: config.user,
	password: config.password,
	twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
 };

client.logOn(logOnOption);


//events

client.on('loggedOn', () => { 
	client.setPersona(SteamUser.EPersonaState.Online);
	client.gamesPlayed([570]);
	console.log('Currently Logged In!');
	console.log('Script is Running');
});

client.on("friendMessage", function(steamID,message){
	client.chatMessage(steamID, "hello, autoreply is working! Great!");
});

client.on("webSession", (sessionid, cookies) => {
	manager.setCookies(cookies);
	community.setCookies(cookies); 
	community.startConfirmationChecker(10000,config.identitySecret);
} );

function acceptOffer(offer){ 
	offer.accept((err) => {
		community.checkConfirmations();
		console.log("Trade was successfully made!");
		if(err) {
			console.log("Error Occured while ACCEPTING the trade offer.");
		}
	});
}

function declineOffer(offer){ 
	offer.decline((err) => {
		console.log("The offer was declined!");
		if(err) {
			console.log("Error Occured while DECLINING the trade offer.");
		}
	});
}

client.setOption("promptSteamGuardCode", false);  

manager.on("newOffer", (offer)=> {
	if(offer.partner.getSteamID64() === config.adminID){
		acceptOffer(offer); 
	}else{
		declineOffer(offer);
	}
})
