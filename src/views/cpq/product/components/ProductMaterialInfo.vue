<template>
  <div class="material-info-container">
    <el-form-item label="产品主图" prop="mainImageUrl">
      <!-- 上传按钮 -->
      <el-upload 
        class="upload-demo" 
        :action="uploadUrl" 
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError" 
        :before-upload="beforeUpload" 
        :limit="1" 
        :file-list="mainImageFileList"
        :auto-upload="true" 
        accept=".jpg,.jpeg,.png"
        :show-file-list="false"
      >
        <el-button type="primary" icon="Plus">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB
          </div>
        </template>
      </el-upload>
      
      <!-- 主图预览区域 - 位于【主图】位置 -->
      <div class="main-image-container" style="margin-top: 10px;" :key="refreshKey">
        <!-- 主图预览 -->
        <div v-if="form.mainImageUrl" class="main-image-preview" style="display: inline-block; margin-right: 20px;">
          <el-image 
            :src="form.mainImageUrl" 
            :key="form.mainImageUrl"
            style="width: 200px; height: 200px; object-fit: contain; border: 1px solid #e4e7ed; border-radius: 8px;"
            fit="contain"
          />
          <el-button 
            type="danger" 
            size="small" 
            @click="removeMainImage" 
            style="margin-top: 10px;"
          >
            移除主图
          </el-button>
        </div>
        
        <!-- 未上传时的占位图 - 位于【主图】位置 -->
        <div v-else class="main-image-placeholder" style="display: inline-block; margin-right: 20px;">
          <el-image 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f5f7fa' stroke='%23e4e7ed' stroke-width='1' rx='8'/%3E%3Ctext x='50%25' y='50%25' font-size='20' fill='%23909399' text-anchor='middle' dominant-baseline='middle'%3E主图%3C/text%3E%3C/svg%3E"
            style="width: 200px; height: 200px; border: 1px solid #e4e7ed; border-radius: 8px;"
          />
        </div>
      </div>
    </el-form-item>

    <el-form-item label="产品图片列表" prop="imageUrls">
      <el-upload class="upload-demo" :action="uploadUrl" :on-success="handleImageListUploadSuccess"
        :on-error="handleUploadError" :before-upload="beforeUpload" :limit="5" :file-list="imageListFileList"
        :auto-upload="true" accept=".jpg,.jpeg,.png">
        <el-button type="primary" icon="Plus">点击上传</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传jpg/png文件，且不超过2MB，最多上传5张
          </div>
        </template>
      </el-upload>
      <div v-if="imageList.length > 0" style="margin-top: 15px; display: flex; gap: 15px; flex-wrap: wrap;">
        <div v-for="(url, index) in imageList" :key="url"
          style="position: relative; border: 1px solid #e4e7ed; border-radius: 8px; padding: 5px; background-color: #f5f7fa;">
          <el-image :src="url" :key="url" style="width: 120px; height: 120px;" fit="cover" />
          <el-button type="danger" size="small" circle style="position: absolute; top: -10px; right: -10px; z-index: 10;
            background-color: #fff; border: 1px solid #f56c6c;" @click="removeImageFromList(index)">
            <el-icon>
              <Close />
            </el-icon>
          </el-button>
        </div>
      </div>
    </el-form-item>

    <el-row :gutter="20">
      <el-col :span="12">
        <!-- 产品详情页URL -->
        <el-form-item label="产品详情页URL" prop="detailPageUrl">
          <el-upload 
            class="upload-demo" 
            :action="uploadUrl" 
            :on-success="handleDetailPageUploadSuccess"
            :on-error="handleUploadError" 
            :before-upload="beforeFileUpload" 
            :limit="1" 
            :file-list="detailPageFileList"
            :auto-upload="true"
            accept=".pdf,.doc,.docx,.html,.htm"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传pdf/doc/docx/html/htm文件，且不超过10MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.detailPageUrl" style="margin-top: 10px;">
            <el-tag>{{ form.detailPageUrl }}</el-tag>
            <el-button type="danger" size="small" @click="removeDetailPageFile" style="margin-left: 10px;">移除</el-button>
          </div>
        </el-form-item>
        
        <!-- 产品3D模型URL -->
        <el-form-item label="产品3D模型URL" prop="model3DUrl">
          <el-upload 
            class="upload-demo" 
            :action="uploadUrl" 
            :on-success="handleModel3DUploadSuccess"
            :on-error="handleUploadError" 
            :before-upload="beforeFileUpload" 
            :limit="1" 
            :file-list="model3DFileList"
            :auto-upload="true"
            accept=".glb,.gltf,.obj,.fbx"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传glb/gltf/obj/fbx文件，且不超过50MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.model3DUrl" style="margin-top: 10px;">
            <el-tag>{{ form.model3DUrl }}</el-tag>
            <el-button type="danger" size="small" @click="removeModel3DFile" style="margin-left: 10px;">移除</el-button>
          </div>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <!-- 产品手册URL -->
        <el-form-item label="产品手册URL" prop="manualUrl">
          <el-upload 
            class="upload-demo" 
            :action="uploadUrl" 
            :on-success="handleManualUploadSuccess"
            :on-error="handleUploadError" 
            :before-upload="beforeFileUpload" 
            :limit="1" 
            :file-list="manualFileList"
            :auto-upload="true"
            accept=".pdf,.doc,.docx"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传pdf/doc/docx文件，且不超过20MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.manualUrl" style="margin-top: 10px;">
            <el-tag>{{ form.manualUrl }}</el-tag>
            <el-button type="danger" size="small" @click="removeManualFile" style="margin-left: 10px;">移除</el-button>
          </div>
        </el-form-item>
        
        <!-- 安装指南URL -->
        <el-form-item label="安装指南URL" prop="installationGuideUrl">
          <el-upload 
            class="upload-demo" 
            :action="uploadUrl" 
            :on-success="handleInstallationGuideUploadSuccess"
            :on-error="handleUploadError" 
            :before-upload="beforeFileUpload" 
            :limit="1" 
            :file-list="installationGuideFileList"
            :auto-upload="true"
            accept=".pdf,.doc,.docx"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传pdf/doc/docx文件，且不超过20MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.installationGuideUrl" style="margin-top: 10px;">
            <el-tag>{{ form.installationGuideUrl }}</el-tag>
            <el-button type="danger" size="small" @click="removeInstallationGuideFile" style="margin-left: 10px;">移除</el-button>
          </div>
        </el-form-item>
        
        <!-- 视频介绍URL -->
        <el-form-item label="视频介绍URL" prop="videoUrl">
          <el-upload 
            class="upload-demo" 
            :action="uploadUrl" 
            :on-success="handleVideoUploadSuccess"
            :on-error="handleUploadError" 
            :before-upload="beforeFileUpload" 
            :limit="1" 
            :file-list="videoFileList"
            :auto-upload="true"
            accept=".mp4,.avi,.mov,.wmv"
          >
            <el-button type="primary" icon="Plus">点击上传</el-button>
            <template #tip>
              <div class="el-upload__tip">
                只能上传mp4/avi/mov/wmv文件，且不超过100MB
              </div>
            </template>
          </el-upload>
          <div v-if="form.videoUrl" style="margin-top: 10px;">
            <el-tag>{{ form.videoUrl }}</el-tag>
            <el-button type="danger" size="small" @click="removeVideoFile" style="margin-left: 10px;">移除</el-button>
          </div>
        </el-form-item>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { updateProduct } from '@/api/cpq/product'

// 定义props
const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

// 定义事件
const emit = defineEmits(['update:form'])

// 文件上传相关
const uploadUrl = ref(import.meta.env.VITE_APP_BASE_API + '/common/upload')
const mainImageFileList = ref([])
const imageListFileList = ref([])
const imageList = ref([])
// 用于强制组件重新渲染的key
const refreshKey = ref(0)

// 其他文件上传相关
const detailPageFileList = ref([])
const model3DFileList = ref([])
const manualFileList = ref([])
const installationGuideFileList = ref([])
const videoFileList = ref([])

// 初始化图片列表
if (props.form.imageUrls) {
  try {
    imageList.value = JSON.parse(props.form.imageUrls)
  } catch (e) {
    imageList.value = []
  }
}

// 文件上传成功处理
const handleUploadSuccess = async (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      // 立即更新本地状态
      const updatedForm = { ...props.form, mainImageUrl: response.url }
      emit('update:form', updatedForm)
      mainImageFileList.value = fileList
      
      try {
        // 保存到后台
        await updateProduct(updatedForm)
        ElMessage.success('上传成功，已保存到后台')
        // 立即刷新页面，显示最新状态
        refreshKey.value++
      } catch (error) {
        ElMessage.error('保存到后台失败：' + (error.message || '未知错误'))
        // 保存失败，恢复之前的状态
        emit('update:form', props.form)
        mainImageFileList.value = []
      }
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 图片列表上传成功处理
const handleImageListUploadSuccess = async (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      // 立即更新本地状态
      imageList.value.push(response.url)
      imageListFileList.value = fileList
      
      // 立即更新表单数据
      const updatedForm = { ...props.form, imageUrls: JSON.stringify(imageList.value) }
      emit('update:form', updatedForm)
      
      try {
        // 保存到后台
        await updateProduct(updatedForm)
        ElMessage.success('上传成功，已保存到后台')
        // 立即刷新页面，显示最新状态
        refreshKey.value++
      } catch (error) {
        ElMessage.error('保存到后台失败：' + (error.message || '未知错误'))
        // 保存失败，恢复之前的状态
        imageList.value.pop()
        imageListFileList.value = fileList.slice(0, -1)
        emit('update:form', props.form)
      }
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 产品详情页上传成功处理
const handleDetailPageUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      const updatedForm = { ...props.form, detailPageUrl: response.url }
      emit('update:form', updatedForm)
      detailPageFileList.value = fileList
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 产品3D模型上传成功处理
const handleModel3DUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      const updatedForm = { ...props.form, model3DUrl: response.url }
      emit('update:form', updatedForm)
      model3DFileList.value = fileList
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 产品手册上传成功处理
const handleManualUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      const updatedForm = { ...props.form, manualUrl: response.url }
      emit('update:form', updatedForm)
      manualFileList.value = fileList
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 安装指南上传成功处理
const handleInstallationGuideUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      const updatedForm = { ...props.form, installationGuideUrl: response.url }
      emit('update:form', updatedForm)
      installationGuideFileList.value = fileList
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 视频介绍上传成功处理
const handleVideoUploadSuccess = (response, file, fileList) => {
  if (response.code === 200) {
    if (response.url) {
      const updatedForm = { ...props.form, videoUrl: response.url }
      emit('update:form', updatedForm)
      videoFileList.value = fileList
      ElMessage.success('上传成功')
    } else {
      ElMessage.error('上传失败：返回数据格式错误')
    }
  } else {
    ElMessage.error('上传失败：' + (response.msg || '未知错误'))
  }
}

// 文件上传失败处理
const handleUploadError = (err, file, fileList) => {
  ElMessage.error('上传失败，请重试')
}

// 从图片列表中移除图片
const removeImageFromList = async (index) => {
  // 保存移除前的状态，用于失败时恢复
  const removedUrl = imageList.value[index]
  const removedFile = imageListFileList.value[index]
  const prevImageList = [...imageList.value]
  const prevImageListFileList = [...imageListFileList.value]
  const prevForm = { ...props.form }
  
  // 立即更新本地状态
  imageList.value.splice(index, 1)
  imageListFileList.value.splice(index, 1)
  
  // 立即更新表单数据
  const updatedForm = { ...props.form, imageUrls: JSON.stringify(imageList.value) }
  emit('update:form', updatedForm)
  
  try {
    // 保存到后台
    await updateProduct(updatedForm)
    ElMessage.success('图片已移除，已保存到后台')
    // 立即刷新页面，显示最新状态
    refreshKey.value++
  } catch (error) {
    ElMessage.error('保存到后台失败：' + (error.message || '未知错误'))
    // 保存失败，恢复之前的状态
    imageList.value = prevImageList
    imageListFileList.value = prevImageListFileList
    emit('update:form', prevForm)
  }
}

// 移除产品详情页文件
const removeDetailPageFile = () => {
  const updatedForm = { ...props.form, detailPageUrl: '' }
  emit('update:form', updatedForm)
  detailPageFileList.value = []
}

// 移除产品3D模型文件
const removeModel3DFile = () => {
  const updatedForm = { ...props.form, model3DUrl: '' }
  emit('update:form', updatedForm)
  model3DFileList.value = []
}

// 移除产品手册文件
const removeManualFile = () => {
  const updatedForm = { ...props.form, manualUrl: '' }
  emit('update:form', updatedForm)
  manualFileList.value = []
}

// 移除安装指南文件
const removeInstallationGuideFile = () => {
  const updatedForm = { ...props.form, installationGuideUrl: '' }
  emit('update:form', updatedForm)
  installationGuideFileList.value = []
}

// 移除视频介绍文件
const removeVideoFile = () => {
  const updatedForm = { ...props.form, videoUrl: '' }
  emit('update:form', updatedForm)
  videoFileList.value = []
}

// 移除产品主图
const removeMainImage = async () => {
  // 立即更新本地状态
  const updatedForm = { ...props.form, mainImageUrl: '' }
  emit('update:form', updatedForm)
  mainImageFileList.value = []
  
  try {
    // 保存到后台
    await updateProduct(updatedForm)
    ElMessage.success('主图已移除，已保存到后台')
    // 立即刷新页面，显示最新状态
    refreshKey.value++
  } catch (error) {
    ElMessage.error('保存到后台失败：' + (error.message || '未知错误'))
    // 保存失败，恢复之前的状态
    emit('update:form', props.form)
  }
}

// 图片上传前验证
const beforeUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }

  return true
}

// 文件上传前验证
const beforeFileUpload = (file) => {
  // 根据文件类型设置不同的大小限制
  let maxSize = 10 * 1024 * 1024 // 默认10MB
  
  // 获取文件扩展名
  const fileExt = file.name.split('.').pop().toLowerCase()
  
  // 根据文件类型调整大小限制
  if (['glb', 'gltf', 'obj', 'fbx'].includes(fileExt)) {
    maxSize = 50 * 1024 * 1024 // 3D模型文件最大50MB
  } else if (['mp4', 'avi', 'mov', 'wmv'].includes(fileExt)) {
    maxSize = 100 * 1024 * 1024 // 视频文件最大100MB
  } else if (['pdf', 'doc', 'docx'].includes(fileExt)) {
    maxSize = 20 * 1024 * 1024 // 文档文件最大20MB
  }
  
  // 检查文件大小
  const isLtMax = file.size < maxSize
  if (!isLtMax) {
    const maxSizeMB = maxSize / 1024 / 1024
    ElMessage.error(`上传文件大小不能超过 ${maxSizeMB}MB!`)
    return false
  }
  
  return true
}

// 监听form变化，更新图片列表
watch(
  () => props.form.imageUrls,
  (newImageUrls) => {
    if (newImageUrls) {
      try {
        imageList.value = JSON.parse(newImageUrls)
      } catch (e) {
        imageList.value = []
      }
    } else {
      imageList.value = []
    }
  }
)

// 移除了深度watch监听器，避免无限递归更新
</script>

<style scoped>
.material-info-container {
  padding: 10px 0;
}
</style>