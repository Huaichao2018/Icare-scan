// #ifdef APP
import {
	pathToBase64,
	base64ToPath
} from 'image-tools'
// #endif

export function formatDate(timestamp) {
	// 创建一个新的Date对象
	let date = new Date(timestamp);

	// 获取年、月、日、小时、分钟、秒
	let year = date.getFullYear();
	let month = date.getMonth() + 1; // 月份从0开始，所以需要加1
	let day = date.getDate();
	let hours = date.getHours();
	let minutes = date.getMinutes();
	let seconds = date.getSeconds();

	// 格式化输出
	let formattedDate =
		`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

	return formattedDate;
}

export function formatTime(timezone) {
	// 获取时间组成部分
	if (typeof timezone !== "number") {
		return new Date();
	}
	var d = new Date();
	var len = d.getTime();
	var offset = d.getTimezoneOffset() * 60000;
	var utcTime = len + offset;
	let date = new Date(utcTime + 3600000 * timezone);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	const hour = String(date.getHours()).padStart(2, '0');
	const minute = String(date.getMinutes()).padStart(2, '0');
	const second = String(date.getSeconds()).padStart(2, '0');

	// 按照指定格式组合
	return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export async function appFormat(img) {
	// 1._this.imgUrl 就是文件
	const str = await pathToBase64(img)
	return str.split('base64,')[1]
}
export function h5Format(img) {
	return new Promise((reslove, reject) => {
		fetch(img)
			.then(response => response.blob())
			.then(blob => {
				// 在这里可以处理 Blob 对象，如上传到服务器
				//1. Blob 对象转换为base64
				const reader = new FileReader();
				reader.onloadend = function() {
					const base64Data = reader.result; // 获取 base64 格式的数据
					reslove(base64Data.split('base64,')[1]);
				};
				reader.readAsDataURL(blob); // 使用 readAsDataURL 方法进行转换
				// Blob 对象转换为base64 end
			})
			.catch(error => {
				console.error('获取 Blob 对象时发生错误：', error);
				reject(error);
			});
	})

}
export function wxFormat(img) {
	return new Promise((reslove, reject) => {
		uni.request({
			url: img,
			method: 'GET',
			responseType: 'arraybuffer',
			success: function(res) {
				// 1.在这里你可以使用获取到的 Base64 编码进行操作
				const base64Str = wx.arrayBufferToBase64(res
					.data);
				reslove(base64Str);
			},
			fail: function(error) {
				console.error(error);
				// 处理请求失败
				reject(error);
			}
		});
	})
}

/**树形结构转扁平数组 */
export function treeToList(tree) {
	var queen = []
	var out = []
	queen = queen.concat(tree)
	while (queen.length) {
		var first = queen.shift()
		if (first.children) {
			queen = [...first.children, ...queen]
		}
		out.push(first)
	}
	return out
};