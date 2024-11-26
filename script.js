const imageInput = document.getElementById("image-input");
const processBtn = document.getElementById("process-btn");
const operationSelect = document.getElementById("operation");
const originalImage = document.getElementById("original-image");
const resultImage = document.getElementById("result-image");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const backBtn = document.getElementById("back-btn");

processBtn.addEventListener("click", () => {
    const file = imageInput.files[0];
    const operation = operationSelect.value;

    if (!file) {
        alert("Please select an image file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // Tampilkan gambar asli
            originalImage.src = e.target.result;

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            if (operation === "grayscale") {
                imageData = applyGrayscale(imageData);
            } else if (operation === "blur") {
                imageData = applyBlur(imageData);
            }

            ctx.putImageData(imageData, 0, 0);
            resultImage.src = canvas.toDataURL();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

backBtn.addEventListener("click", () => {
    imageInput.value = "";
    originalImage.src = "";
    resultImage.src = "";
});

function applyGrayscale(imageData) {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
        data[i] = data[i + 1] = data[i + 2] = gray;
    }
    return imageData;
}

function applyBlur(imageData) {
    const { data, width, height } = imageData;
    const copy = new Uint8ClampedArray(data);
    const kernel = [
        [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
        [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
        [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
        [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
        [1 / 25, 1 / 25, 1 / 25, 1 / 25, 1 / 25],
    ];

    for (let y = 2; y < height - 2; y++) {
        for (let x = 2; x < width - 2; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                for (let ky = -2; ky <= 2; ky++) {
                    for (let kx = -2; kx <= 2; kx++) {
                        const px = (y + ky) * width + (x + kx);
                        sum += kernel[ky + 2][kx + 2] * copy[(px * 4) + c];
                    }
                }
                const index = (y * width + x) * 4 + c;
                data[index] = sum;
            }
        }
    }

    return imageData;
}