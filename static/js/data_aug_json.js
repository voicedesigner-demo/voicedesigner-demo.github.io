/* Built from samples/data_aug_pairs/*.json — run: node scripts/build_data_aug_json.js */
window.DATA_AUG_JSON = {
  "char_deep_bass": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "shift_pitch_by_semitones",
          "params": {
            "pitch_semitones": {
              "range": [
                -6,
                -8,
                0.5
              ]
            }
          }
        }
      ],
      "ch2": [
        {
          "name": "shift_pitch_by_semitones",
          "params": {
            "pitch_semitones": {
              "range": [
                -24,
                -16,
                0.5
              ]
            }
          }
        },
        {
          "name": "pb_distortion",
          "params": {
            "drive_db": {
              "range": [
                0,
                6,
                1
              ]
            }
          }
        },
        {
          "name": "bandpass_filter_scipy",
          "params": {
            "lowcut_hz": 20,
            "highcut_hz": 2400
          }
        }
      ],
      "ch3": [
        {
          "name": "pw_whisper",
          "params": {}
        },
        {
          "name": "bandpass_filter_scipy",
          "params": {
            "lowcut_hz": 500,
            "highcut_hz": 0
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 0.75,
      "ch2": 0.25,
      "ch3": 0.25
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "char_evil_low": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "shift_pitch_by_semitones",
          "params": {
            "pitch_semitones": {
              "range": [
                -6,
                -3,
                0.5
              ]
            }
          }
        },
        {
          "name": "pb_reverb",
          "params": {
            "room_size": {
              "range": [
                0.05,
                0.25,
                0.025
              ]
            },
            "wet_level": 0.05
          }
        }
      ],
      "ch2": [
        {
          "name": "shift_pitch_by_semitones",
          "params": {
            "pitch_semitones": {
              "range": [
                3,
                6,
                0.5
              ]
            }
          }
        },
        {
          "name": "pb_delay",
          "params": {
            "delay_seconds": {
              "range": [
                0.05,
                0.15,
                0.025
              ]
            },
            "feedback": 0.5,
            "mix": 0.05
          }
        },
        {
          "name": "bandpass_filter_scipy",
          "params": {
            "lowcut_hz": 50,
            "highcut_hz": 2500
          }
        },
        {
          "name": "pb_gain",
          "params": {
            "gain_db": {
              "range": [
                -3,
                3,
                0.5
              ]
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 0.75,
      "ch2": 0.25
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "char_heavy_robot": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "process_audio_pitch_sifigan",
          "params": {
            "pitch_curve_fn": "quantize_flatten",
            "curve_args": {
              "pitch_semitones": {
                "range": [
                  -1,
                  1,
                  1
                ]
              },
              "quantize_to": "note",
              "flatten_window": {
                "range": [
                  75,
                  125,
                  5
                ]
              }
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "char_radio": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "pb_gsm_compression",
          "params": {}
        },
        {
          "name": "bandpass_filter_scipy",
          "params": {
            "lowcut_hz": {
              "range": [
                200,
                400,
                50
              ]
            },
            "highcut_hz": {
              "range": [
                3000,
                5000,
                250
              ]
            }
          }
        }
      ],
      "ch2": [
        {
          "name": "pb_bitcrush",
          "params": {
            "bit_depth": 2
          }
        },
        {
          "name": "bandpass_filter_scipy",
          "params": {
            "lowcut_hz": 0,
            "highcut_hz": {
              "range": [
                3000,
                5000,
                250
              ]
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 0.45,
      "ch2": 0.025
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "char_step_robot": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "process_audio_pitch_sifigan",
          "params": {
            "pitch_curve_fn": "step_flatten",
            "curve_args": {
              "block_len_min": {
                "range": [
                  64,
                  128,
                  1
                ]
              },
              "block_len_max": {
                "range": [
                  128,
                  256,
                  1
                ]
              },
              "gap_min": 0,
              "gap_max": 0
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "char_tiny": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "shift_pitch_by_semitones",
          "params": {
            "pitch_semitones": {
              "range": [
                2,
                4,
                0.5
              ]
            }
          }
        },
        {
          "name": "time_stretch",
          "params": {
            "stretch_factor": {
              "range": [
                1,
                1.05,
                0.025
              ]
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "expression_low": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "process_audio_pitch_sifigan",
          "params": {
            "pitch_curve_fn": "quantize_flatten",
            "curve_args": {
              "pitch_semitones": 0,
              "quantize_to": "none",
              "flatten_window": 0,
              "range_scale": 0.25
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1,
      "ch2": 0
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "formant_down_2": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "praat_formant_shifting",
          "params": {
            "formant_semitones": {
              "range": [
                -2,
                -2,
                1
              ]
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "formant_up_2": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "praat_formant_shifting",
          "params": {
            "formant_semitones": {
              "range": [
                2,
                2,
                1
              ]
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "pitch_down_6": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "process_audio_pitch_sifigan",
          "params": {
            "pitch_curve_fn": "quantize_flatten",
            "curve_args": {
              "pitch_semitones": -6,
              "quantize_to": "none",
              "flatten_window": 0,
              "range_scale": 1
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1,
      "ch2": 0
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  },
  "pitch_up_6": {
    "channel_fx_chains": {
      "ch1": [
        {
          "name": "process_audio_pitch_sifigan",
          "params": {
            "pitch_curve_fn": "quantize_flatten",
            "curve_args": {
              "pitch_semitones": 6,
              "quantize_to": "none",
              "flatten_window": 0,
              "range_scale": 1
            }
          }
        }
      ]
    },
    "mix_weights": {
      "ch1": 1,
      "ch2": 0
    },
    "master_fx_chain": [
      {
        "name": "pb_limiter",
        "params": {
          "threshold_db": 0
        }
      }
    ]
  }
};
