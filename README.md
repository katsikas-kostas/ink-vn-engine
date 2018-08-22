# VisualNov'Ink

So, you always wanted to make visual novels using [ink](https://github.com/inkle/ink)? I got you covered.  

This project is currently under heavy development, use at your own discretion.

## How does it work?

### Write your ink file

Write your story as you'd usually do it.  
You should make an extensive use of tags to control what's displayed on screen.  

* Backgrounds can be switched
```
# background: path/to/your/background.png
```

* Character names can be displayed or hidden
```
# name: Paulloz
Or it can be used like this! # Paulloz
# name:
```

* Sprites can be displayed or removed (for now, only one sprite can be displayed at a time)
```
# sprite: path/to/your/sprite.png
# sprite: 
```

* Transitions can be played (fade is the only implemented one for now)
```
# transition: fade
```

* Files can be preloaded to load instantly in the future
```
# preload: path/to/an/image.png, and/another/one.png
```

### Include everything in your HTML

Just include the lib in your HTML file and create a new `VisualNovInk` object, giving it your ink file, an HTML element ID (a canvas is going to be created within it) and your VN width and height.

```html
<!DOCTYPE html>
<html>
    <body>
        <div id="vn"></div>
        <script src="visualnov-ink.js"></script>
        <script type="text/javascript">
            window.onload = function() {
                var vn = new VisualNovInk.VisualNovInk("story.json", "vn", 1280, 720);
            };
        </script>
    </body>
</html>
```
## Roadmap

This is what is going to be implemented soon:

* Better choice placements
* Use pictures as text backgrounds
  * simple picture
  * repeating pattern
  * 9 patch
* Manage multiple sprites on screen
* Highlight the speaking character's sprite
* Manage audio
  * Music
  * SFX
* Change text speed and other options on the go
* WebGL?

## License

This software is released under MIT license (see the [LICENSE](/LICENSE) file for more information).
