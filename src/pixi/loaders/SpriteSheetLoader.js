/**
 * @author Mat Groves http://matgroves.com/ @Doormat23
 */

/**
 * The sprite sheet loader is used to load in JSON sprite sheet data
 * To generate the data you can use http://www.codeandweb.com/texturepacker and publish the "JSON" format
 * There is a free version so thats nice, although the paid version is great value for money.
 * It is highly recommended to use Sprite sheets (also know as texture atlas") as it means sprite"s can be batched and drawn together for highly increased rendering speed.
 * Once the data has been loaded the frames are stored in the PIXI texture cache and can be accessed though PIXI.Texture.fromFrameId() and PIXI.Sprite.fromFromeId()
 * This loader will also load the image file that the Spritesheet points to as well as the data.
 * When loaded this class will dispatch a "loaded" event
 * @class SpriteSheetLoader
 * @extends EventTarget
 * @constructor
 * @param {String} url the url of the sprite sheet JSON file
 * @param {Boolean} crossorigin
 */

PIXI.SpriteSheetLoader = function(url, crossorigin)
{
	/*
	 * i use texture packer to load the assets..
	 * http://www.codeandweb.com/texturepacker
	 * make sure to set the format as "JSON"
	 */
	PIXI.EventTarget.call(this);
	this.url = url;
	this.baseUrl = url.replace(/[^\/]*$/, "");
	this.texture = null;
	this.frames = {};
	this.crossorigin = crossorigin;
};

// constructor
PIXI.SpriteSheetLoader.constructor = PIXI.SpriteSheetLoader;

/**
 * This will begin loading the JSON file
 */
PIXI.SpriteSheetLoader.prototype.load = function()
{
	this.ajaxRequest = new AjaxRequest();
	var scope = this;
	this.ajaxRequest.onreadystatechange = function()
	{
		scope.onJSONLoaded();
	};
		
	this.ajaxRequest.open("GET", this.url, true);
	if (this.ajaxRequest.overrideMimeType) this.ajaxRequest.overrideMimeType("application/json");
	this.ajaxRequest.send(null)
};

/**
 * Invoke when JSON file is loaded
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onJSONLoaded = function()
{
	if (this.ajaxRequest.readyState == 4)
	{
		 if (this.ajaxRequest.status == 200 || window.location.href.indexOf("http") == -1)
	 	{
			var jsonData = eval("(" + this.ajaxRequest.responseText + ")");
			var textureUrl = this.baseUrl + jsonData.meta.image;

            var image = new PIXI.ImageLoader(textureUrl, this.crossorigin);
            this.texture = image.texture.baseTexture;
            var scope = this;
            image.addEventListener("loaded", function(event) {
                 scope.onLoaded();
            });

			var frameData = jsonData.frames;
			for (var i in frameData)
			{
				var rect = frameData[i].frame;
				if (rect)
				{
					PIXI.TextureCache[frameData[i].filename] = new PIXI.Texture(this.texture, {x:rect.x, y:rect.y, width:rect.w, height:rect.h});
					
					if(frameData[i].trimmed)
					{
						//var realSize = frameData[i].spriteSourceSize;
						PIXI.TextureCache[frameData[i].filename].realSize = frameData[i].spriteSourceSize;
						PIXI.TextureCache[frameData[i].filename].trim.x = 0;// (realSize.x / rect.w)
						// calculate the offset!
					}
				}
   			}

            image.load();
	 	}
	}	
};
/**
 * Invoke when all files are loaded (json and texture)
 * @private
 */
PIXI.SpriteSheetLoader.prototype.onLoaded = function()
{
    this.dispatchEvent({type: "loaded", content: this});
};
