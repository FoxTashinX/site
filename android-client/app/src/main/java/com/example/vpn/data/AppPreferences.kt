package com.example.vpn.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringSetPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "vpn_routing_prefs")

class AppPreferences(private val context: Context) {

    companion object {
        // True = Proxy ONLY selected apps (Include mode)
        // False = Bypass selected apps (Exclude mode)
        val IS_INCLUDE_MODE = booleanPreferencesKey("is_include_mode")
        val SELECTED_PACKAGES = stringSetPreferencesKey("selected_packages")
    }

    val isIncludeMode: Flow<Boolean> = context.dataStore.data
        .map { preferences ->
            preferences[IS_INCLUDE_MODE] ?: true // Default to Include Mode
        }

    val selectedPackages: Flow<Set<String>> = context.dataStore.data
        .map { preferences ->
            preferences[SELECTED_PACKAGES] ?: emptySet()
        }

    suspend fun setIncludeMode(isInclude: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[IS_INCLUDE_MODE] = isInclude
        }
    }

    suspend fun updateSelectedPackages(packages: Set<String>) {
        context.dataStore.edit { preferences ->
            preferences[SELECTED_PACKAGES] = packages
        }
    }
}
