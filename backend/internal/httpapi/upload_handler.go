package httpapi

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const maxUploadBytes = 25 << 20

var allowedExt = map[string]bool{
	".jpg": true, ".jpeg": true, ".png": true, ".gif": true,
	".webp": true, ".svg": true, ".pdf": true,
}

func (s *Server) handleUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxUploadBytes)
	if err := r.ParseMultipartForm(maxUploadBytes); err != nil {
		writeError(w, http.StatusBadRequest, "file too large or invalid form")
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		writeError(w, http.StatusBadRequest, "missing file field")
		return
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(header.Filename))
	if !allowedExt[ext] {
		writeError(w, http.StatusBadRequest, "unsupported file type")
		return
	}

	if err := os.MkdirAll(s.cfg.UploadDir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "could not prepare upload dir")
		return
	}

	name := time.Now().Format("20060102") + "-" + randHex(8) + ext
	dst, err := os.Create(filepath.Join(s.cfg.UploadDir, name))
	if err != nil {
		writeError(w, http.StatusInternalServerError, "could not save file")
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		writeError(w, http.StatusInternalServerError, "could not write file")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"url":      "/uploads/" + name,
		"filename": name,
	})
}

func randHex(n int) string {
	b := make([]byte, n)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
