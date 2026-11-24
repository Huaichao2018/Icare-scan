# cf-picmark
```
	//组件
	<cf-picmark ref="picmark"></cf-picmark>
	//引入
	import Imagmark from "../../uni_modules/cf-picmark/components/cf-picmark/cf-picmark.vue"
	//方法
	this.$refs.picmark.getmark({
	imageSrc: res,//图片地址
	text: "水印",//水印文字内容
	fontsize:50,//文字大小
	fillstyle:"blue",//文字颜色
	complete(re) {//成功回调方法
		//返回水印临时路径
		console.log(re, "2222");
		this.img = re//赋值给当前页面数据
	}
})
```