# Computer graphics

## 目錄
* 開啟方式
* Final Project
* HW
  * HW1
  * HW2
  * HW3
  * HW4
* Lab
  * L1
  * L2
  * L3
  * L4
  * L5
  * L6
  * L7
  * L8
  * L9
  * L10
  * L11
  * L12
  * L13
### 開啟方式
* 建立伺服器
'''python
    python -m http.server 5050
'''
* 開啟瀏覽器，並輸入localhost，找到要開啟的檔案(index.html)
  > note : Chrome 不支援 WebGL

### Final Project
* 截圖畫面
![Alt text](Final%20project/%E6%88%AA%E5%9C%96.png)
* 運用技術

    |  物件 |    技術  | 
    |:------:|:------:|
    | 地面  | Bump mApping  | 
    | 天空  | Environment cube map  | 
    | 水晶球  | Dynamic reflection  | 
    | 太空人、柴犬、太空船  | Texture mApping  | 
    | 所有物件  | Local illumination  | 
    | 方塊  | Cube map refraction  | 

* 可人為移動的物件: 太空人、方塊、星星
* 可切換視角 (全局第三人、太空人第一人稱)
* 光源為圖一上灰球；水晶球為圖一左球；方塊為圖一右下