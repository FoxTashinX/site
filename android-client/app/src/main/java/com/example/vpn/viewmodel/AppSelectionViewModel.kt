package com.example.vpn.viewmodel

import android.app.Application
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.drawable.Drawable
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.vpn.data.AppPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class AppItem(
    val packageName: String,
    val appName: String,
    val icon: Drawable
)

class AppSelectionViewModel(application: Application) : AndroidViewModel(application) {

    private val appPreferences = AppPreferences(application)

    private val _installedApps = MutableStateFlow<List<AppItem>>(emptyList())
    
    private val _displayedApps = MutableStateFlow<List<AppItem>>(emptyList())
    val displayedApps: StateFlow<List<AppItem>> = _displayedApps.asStateFlow()

    private val _selectedPackages = MutableStateFlow<Set<String>>(emptySet())
    val selectedPackages: StateFlow<Set<String>> = _selectedPackages.asStateFlow()

    private val _isIncludeMode = MutableStateFlow(true)
    val isIncludeMode: StateFlow<Boolean> = _isIncludeMode.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    init {
        loadPreferences()
        loadInstalledApps()
    }

    private fun loadPreferences() {
        viewModelScope.launch {
            _isIncludeMode.value = appPreferences.isIncludeMode.first()
            _selectedPackages.value = appPreferences.selectedPackages.first()
        }
    }

    private fun loadInstalledApps() {
        viewModelScope.launch {
            _isLoading.value = true
            val pm: PackageManager = getApplication<Application>().packageManager
            val apps = withContext(Dispatchers.IO) {
                pm.getInstalledApplications(PackageManager.GET_META_DATA)
                    .filter { appInfo ->
                        // Optional: filter out system apps if needed
                        // (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0 || (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0
                        true // For now, allow selecting system apps
                    }
                    .map { appInfo ->
                        AppItem(
                            packageName = appInfo.packageName,
                            appName = pm.getApplicationLabel(appInfo).toString(),
                            icon = pm.getApplicationIcon(appInfo)
                        )
                    }
                    .sortedBy { it.appName.lowercase() }
            }
            _installedApps.value = apps
            _displayedApps.value = apps
            _isLoading.value = false
        }
    }

    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        if (query.isBlank()) {
            _displayedApps.value = _installedApps.value
        } else {
            val lowerQuery = query.lowercase()
            _displayedApps.value = _installedApps.value.filter {
                it.appName.lowercase().contains(lowerQuery) || 
                it.packageName.lowercase().contains(lowerQuery)
            }
        }
    }

    fun toggleAppSelection(packageName: String, isSelected: Boolean) {
        val currentSet = _selectedPackages.value.toMutableSet()
        if (isSelected) {
            currentSet.add(packageName)
        } else {
            currentSet.remove(packageName)
        }
        _selectedPackages.value = currentSet
        saveSelectedPackages(currentSet)
    }

    fun selectAll() {
        val allPackages = _displayedApps.value.map { it.packageName }.toSet()
        val currentSet = _selectedPackages.value.toMutableSet()
        currentSet.addAll(allPackages)
        _selectedPackages.value = currentSet
        saveSelectedPackages(currentSet)
    }

    fun deselectAll() {
        val displayedPackages = _displayedApps.value.map { it.packageName }.toSet()
        val currentSet = _selectedPackages.value.toMutableSet()
        currentSet.removeAll(displayedPackages)
        _selectedPackages.value = currentSet
        saveSelectedPackages(currentSet)
    }

    fun toggleRoutingMode(isInclude: Boolean) {
        _isIncludeMode.value = isInclude
        viewModelScope.launch {
            appPreferences.setIncludeMode(isInclude)
        }
    }

    private fun saveSelectedPackages(packages: Set<String>) {
        viewModelScope.launch {
            appPreferences.updateSelectedPackages(packages)
        }
    }
}
