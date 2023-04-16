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
#### 以圖中太空人為使用者，可選擇以太空人的第一視角或以全局的第三視角來探索此場景。

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
* 光源為全局視角上灰球；水晶球為左球；方塊為右下
* 可人為移動的物件: 太空人、方塊、星星
* 可切換視角 (全局第三人、太空人第一人稱)
    |  全局視角 |    太空人視角  | 
    |:------:|:------:|
    | ![Alt text](Final%20project/%E5%85%A8%E5%B1%80.jpg)  |  ![Alt text](Final%20project/%E5%A4%AA%E7%A9%BA%E4%BA%BA%E8%A6%96%E8%A7%92.jpg)| 
* 	操作說明:
	<br>鍵盤輸入: 
        W:前進 A:向左 S:後退 D:向右 I:向上 K:向下 Z:切換視角
	<br>滑鼠拖曳: 轉動視角
